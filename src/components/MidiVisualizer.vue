<template>
  <div tabindex="3" @keydown.ctrl.up="aumenta" @keydown.ctrl.down="disminuye" class="cuerpo"  >
    <slot>
      <BarraMenu :listChannel="listChannel" @SelectChannel="seleccion" @aumenta="aumenta" @disminuye="disminuye" />
    </slot>
    <div style="height: 40px;">
      <canvas ref="gridcanvas" id="gridcanvas"></canvas>
    </div >
    <div tabindex="2" ref="visualization" id="visualization">

      <div tabindex="1" ref="contCanvas" class="contCanvas">
        <canvas ref='rCanvas' id="idCanvas"></canvas>
    </div>
  </div>
      <div style="display: flex ; align-items: center;">
        <div style="width: 100%; ">
          <BarraScroll ref="scrollbar" :contentLength="contentLength" />
        </div>
        
        <div class="zoom-svg" @click.prevent="aumenta">
          <svg-icon type="mdi" :path="mdiPlusCircle" ></svg-icon>
          
        </div>
        <div class="zoom-svg" @click.prevent="scaleReturn">
          <svg-icon type="mdi" :path="mdiAlbum" ></svg-icon>
        </div>
        <div class="zoom-svg" @click.prevent="disminuye">
          <svg-icon type="mdi" :path="mdiMinusCircle" ></svg-icon>
        </div>
      </div>
  </div>
</template>

<script setup>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiPlusCircle, mdiMinusCircle ,mdiAlbum} from '@mdi/js';
import BarraMenu from '@/components/BarraMenu.vue'
import BarraScroll from '@/components/BarraScroll.vue'
import { debounce } from 'lodash'
import { parseArrayBuffer } from 'midi-json-parser'
import { toRefs, ref, onMounted, onBeforeMount, onUnmounted, watch, onUpdated, computed } from 'vue'
import { paintCanvas } from '@/components/utils/paintCanvas.js'
const listChannel = ref([]);
let visualization = ref(null)
let svg = ref(null)
let arrayBuffer = ref(null)
const contentLength = ref(0)
const scrollbar = ref(null)
const contCanvas = ref(null)
let usporquarter=0
let scale_temp = { x: 1, y: 1 }
const color1 = '#8dbf8b'
const color2 = '#fcf1d8'
const color3 = '#fadc9c'
const color4 = '#f09e56'
const color5 = '#9EA492'
let width = 0
let height = 0
let totalHeight = ref(0)
let totalWidth = ref(0)
let midi = ref(null)
let NOTAS_TOTAL = ref(128);
let firstposiciony = ref(null)
let firstposicionx = ref(null)
let body = ref(null)
let height_note = ref(16)
let tempTracks = {}
const Alltracks = ref({})
const props = defineProps({
  sharedData: Array,
});
const { sharedData } = toRefs(props);
const tecla = () => {
  console.log('tecla')
    
}
const aumenta = () => {
  let tempscale = scale.value.x
  if(tempscale>12){
    tempscale=scale.value.x-10
  }
  else if (tempscale > 1) {
    tempscale = scale.value.x - 1
  }
  else if (tempscale > 0.2) {
    tempscale = scale.value.x - 0.1
  }
  else  {
    console.log('no se puede reducir mas')
    return
  }
  scale.value.x = tempscale
  contentLength.value = totalWidth.value / scale.value.x
  scrollbar.value.scrollOffset = scrollbar.value.scrollOffset+20/tempscale




}
const disminuye = () => {
  let tempscale = scale.value.x
  if (scale.value.x > 200) return
  else if (scale.value.x > 10) {
    tempscale = scale.value.x + 5
  }
  else if (scale.value.x > 1) {
    tempscale = scale.value.x + 1
  }
  else if (scale.value.x > 0) {
    tempscale = scale.value.x + 0.1
  }
  scale.value.x = tempscale
  contentLength.value = totalWidth.value / scale.value.x
  console.log('scale',scale.value.x)
  scrollbar.value.scrollOffset = scrollbar.value.scrollOffset /tempscale
}

const scaleReturn = () => {
  scale.value.x=scale_temp.x
  console.log('scale',scale.value.x)
  contentLength.value = totalWidth.value / scale.value.x
  drawGrid()
  drawRectangles()
}


const seleccion = (value) => {
  if (Alltracks.value[value]) {
    rects.value = Alltracks.value[value]
    drawGrid()
    drawRectangles()
    iniciarScroll(value)
  }
}

watch(
  sharedData,
  (newValue) => {
    newValue.forEach((oracion) => {
      oracion.forEach((silaba) => {

      })
    })
    list_text.value = newValue.flat()

    drawGrid()
    drawRectangles()
  }
);

async function loadDefaultFile() {
  const url1 = '../La_camisa_negra.mid'
  const url2 = '../prueba audio2.mid'
  fetch(url1)
    .then((response) => response.arrayBuffer())
    .then((data) => {
      arrayBuffer.value = data
    })
}
function handleFileUpload(event) {
  file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      arrayBuffer.value = e.target.result
    }
    reader.readAsArrayBuffer(file)
  }
}
async function processFile() {
  if (arrayBuffer.value) {
    try {
      const clonedArrayBuffer = arrayBuffer.value.slice(0)
      midi.value = await parseArrayBuffer(clonedArrayBuffer)
      initializeSVG()
      console.log('procesando archivo')
      procesarMIDI()
      Alltracks.value = tempTracks
      listChannel.value = Object.keys(tempTracks)

    } catch (error) {
      console.error('Error parsing MIDI file:', error)
    }
  }
}
function initializeSVG() {
  width = visualization.value.clientWidth
  height = visualization.value.clientHeight
}
function updateSVG() {
  if (!svg.value || !visualization.value) return
  height = visualization.value.clientHeight
  width = visualization.value.clientWidth
  body.value.style('height', height + 'px')
}
function procesarMIDI() {
  pasoGrilla.value = midi.value.division
  console.log('midi', midi.value)
  // Altura total basada en el rango de notas MIDI
  totalHeight.value = 128 * height_note.value
  // Escala para las notas MIDI
  let maxTime = 0

  midi.value.tracks.forEach((track, trackIndex) => {

    let currentTime = 0
    const noteEvents = []

    // Construir una lista de eventos de notas con duraciones calculadas
    track.forEach((event, index) => {

      currentTime += event.delta
      if(event.timeSignature){
        console.log('timeSignature',event.timeSignature)
      } 
      else if(event.setTempo){
        usporquarter=event.setTempo.microsecondsPerQuarter
        }
      else if (event.noteOn) {
        if (!tempTracks[event.channel]) {

          tempTracks[event.channel] = []
        }
        noteEvents.push({
          noteNumber: event.noteOn.noteNumber,
          startTime: currentTime,
          channel: event.channel,
          velocity: event.noteOn.velocity
        })
      }
      if (event.noteOff) {
        const noteOnEvent = noteEvents.find(
          (e) =>
            e.noteNumber === event.noteOff.noteNumber && e.channel === event.channel && !e.endTime
        )
        if (noteOnEvent) {
          noteOnEvent.endTime = currentTime
          noteOnEvent.duration = currentTime - noteOnEvent.startTime


        }
        if (currentTime > maxTime) {
          maxTime = currentTime
        }
      }
    })
    totalWidth.value = maxTime
    // Dibujar las notas MIDI

    noteEvents.filter((note) => note.endTime).forEach(addItem)
  })

  /* paintNotes() */
}
function addItem(note) {
  const index = tempTracks[note.channel].length > 0 ? tempTracks[note.channel].length : 0

  tempTracks[note.channel].push({
    id: `${index}`,
    x: note.startTime,
    nota: note.noteNumber,
    width: note.duration,
    channel: note.channel,
    velocity: note.velocity
  })
}

function note_yScale(e) {

  return 0 + (e - 0) * (totalHeight.value - 0) / (NOTAS_TOTAL.value - 0)
}

function iniciarScroll(channel = 0) {
  const yPos = totalHeight.value - tempTracks[channel][0].nota * height_note.value
  firstposiciony.value = (yPos - height / 2) / scale.value.y
  firstposicionx.value = tempTracks[channel][0].x - 10
  console.log('firstposiciony', firstposicionx.value)
  scrollbar.value.scrollOffset = firstposicionx.value / scale.value.x
  contCanvas.value.scrollTo(firstposicionx.value, firstposiciony.value)
}

const {gridcanvas, offsetX, pasoGrilla, list_text, rCanvas,grilla, rects, scale, drawGrid, drawRectangles, pickClick, pickDrag, pickRelease } = paintCanvas()


onBeforeMount(async () => {
  loadDefaultFile()
})
watch(
  () => arrayBuffer.value,
  (value) => {
    if (value) {
      drawGrid();
      processFile()
    }
  }
)
function convertirATiempo(cont){
      const t = cont * usporquarter / 1000000;
      const totalSeconds = Math.floor(t);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const milliseconds = Math.floor((t - totalSeconds) * 1000);

      return`${minutes}:${seconds}.${milliseconds}ms`;
    }
watch(
  () => Alltracks.value,
  (value) => {
    if (value) {
      grilla.value = []
      let cont=0
      for (let x = 0; x <= totalWidth.value; x += pasoGrilla.value) {
     const text=convertirATiempo(cont)
     grilla.value.push({"x":x,"text":`${text}`})
     cont++
    } 
      rects.value = value[0]
      if (totalWidth.value < 10000) {
        scale.value = { x: 1, y: 1 }
      }
      else {
        const x = 10 * Math.round(totalWidth.value / 10000 / 10)
        console.log('x', x)
        scale_temp.x = x
        scale.value = { x: x, y: 1 }
      }
       
      contentLength.value = totalWidth.value / scale.value.x
      drawGrid();
      drawRectangles()
      iniciarScroll()
    }
  }
)
let resizeObserver;
function handleResize() {
  rCanvas.value.width = contCanvas.value.clientWidth
  gridcanvas.value.style.width = `${contCanvas.value.clientWidth}px`
  drawGrid();
  drawRectangles()
}
const debouncedHandleResize = debounce(handleResize, 300);
onMounted(() => {
  console.log('anchoTotal', rCanvas.value.width, scale.value.x)
  rCanvas.value.width = contCanvas.value.clientWidth
  gridcanvas.value.style.width = `${contCanvas.value.clientWidth}px`
  console.log('anchoTotal', rCanvas.value.width, scale.value.x)
  rCanvas.value.addEventListener("mousedown", pickClick);
  rCanvas.value.addEventListener("mousemove", pickDrag);
  rCanvas.value.addEventListener("mouseup", pickRelease);
  if (visualization.value) {
    resizeObserver = new ResizeObserver(debouncedHandleResize)
    resizeObserver.observe(visualization.value);
  }
  watch(
    () => scrollbar.value.scrollOffset,
    (value) => {

      console.log(value)
      offsetX.value = value
      drawGrid()
      drawRectangles()

    }
  )

})
onUpdated(() => {

})


/*  onUnmounted(() => {
   rCanvas.value.removeEventListener("mousedown", pickClick);
   rCanvas.value.removeEventListener("mousemove", pickDrag);
   rCanvas.value.removeEventListener("mouseup", pickRelease);
 }) */

</script>


<style>
#app,
.cuerpo {
  width: 100%;
  height: 100vh;
  margin: 0px;
}

.cuerpo {
  flex-direction: column;
  padding-right: 0.5rem;
}

.contCanvas {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  margin: 0%;
  padding: 0;
}

#gridcanvas {
  height: 40px;
}

#visualization {
  width: 100%;
  height: 100%;
  position: relative;
  min-height: 50vh;
  padding: 0;
  background-color: #f0f0f0;

}

.zoom-svg {
  width: 17px;
  height: 17px;
}

.zoom-svg svg {
  width: 17px;
  height: 17px;
  display: block;
}
@media (max-width: 1900px) {
  #visualization {
    width: 100%;
    min-height: 50vh;
    background-color: #f0f0f0;
    height: calc(100vh - 17px - 48px);
  }
}
</style>
