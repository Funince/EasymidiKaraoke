<template>
  <div tabindex="3" @keydown.ctrl.up="aumenta" @keydown.ctrl.down="disminuye" class="cuerpo">
    <slot>
      <BarraMenu :listChannel="listChannel" @SelectChannel="seleccion" @aumenta="aumenta" @disminuye="disminuye"
        @exptAss="exptAss" @exptSrt="exptSrt" />
    </slot>
    <div style="height: 40px">
      <canvas ref="gridcanvas" id="gridcanvas"></canvas>
    </div>
    <div tabindex="2" ref="visualization" id="visualization">
      <div tabindex="1" ref="contCanvas" class="contCanvas">
        <canvas ref="rCanvas" id="idCanvas" @wheel="handleWheel"></canvas>
      </div>
    </div>
    <div style="display: flex; align-items: center; width: 100%">
      <div style="flex-grow: 1; max-width: calc(100% - 17 * 3px)">
        <BarraScroll ref="scrollbar" :contentLength="contentLength" />
      </div>

      <div class="zoom-svg" @click.prevent="aumenta">
        <svg-icon type="mdi" :path="mdiPlusCircle"></svg-icon>
      </div>
      <div class="zoom-svg" @click.prevent="scaleReturn">
        <svg-icon type="mdi" :path="mdiAlbum"></svg-icon>
      </div>
      <div class="zoom-svg" @click.prevent="disminuye">
        <svg-icon type="mdi" :path="mdiMinusCircle"></svg-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatSrt, agruparSilabasSrt } from '@/components/utils/formatSrt';
import formatAss from '@/components/utils/formatAss.js';
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPlusCircle, mdiMinusCircle, mdiAlbum } from '@mdi/js'
import BarraMenu from '@/components/BarraMenu.vue'
import BarraScroll from '@/components/BarraScroll.vue'
import { debounce, clamp } from 'lodash'
import { parseArrayBuffer } from 'midi-json-parser'
import { toRefs, ref, onMounted, onBeforeMount, onUnmounted, watch, onUpdated, computed } from 'vue'
import { paintCanvas } from '@/components/utils/paintCanvas.js'
const {
  gridcanvas,
  offsetX,
  pasoGrilla,
  list_text,
  rCanvas,
  grilla,
  rects,
  scale,
  drawGrid,
  drawRectangles,
  pickClick,
  pickDrag,
  pickRelease,
  exportData
} = paintCanvas()

const listChannel = ref([])
let visualization = ref(null)
let svg = ref(null)
let arrayBuffer = ref(null)
const contentLength = ref(0)
const scrollbar = ref(null)
const contCanvas = ref(null)
let usporquarter = 0
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
let NOTAS_TOTAL = ref(128)
let firstposiciony = ref(null)
let firstposicionx = ref(null)
let body = ref(null)
let height_note = ref(16)
let tempTracks = {}
let oraciones = ref([])
const Alltracks = ref({})
const props = defineProps({
  sharedData: Array
})
const { sharedData } = toRefs(props)

const aumenta = () => {
  let tempscale = scale.value.x
  const newescala = clamp(tempscale * 0.75, 0.25, 50)
  scale.value.x = newescala
  contentLength.value = totalWidth.value / scale.value.x
  scrollbar.value.scrollOffset = (scrollbar.value.scrollOffset * tempscale) / newescala
  drawGrid()
  drawRectangles()
}
const disminuye = () => {
  let tempscale = scale.value.x
  const newescala = clamp(tempscale / 0.75, 0.25, 50)
  scale.value.x = newescala
  contentLength.value = totalWidth.value / scale.value.x
  scrollbar.value.scrollOffset = (scrollbar.value.scrollOffset * tempscale) / newescala

  drawGrid()
  drawRectangles()
}
const handleWheel = (event) => {
  //la barra es igual al ancho - 47 px
  const ancho = rCanvas.value.width - 47
  const r = 100 / ancho
  const mov = event.x * r * 2
  if (event.ctrlKey) {

    event.preventDefault(); // Evita el comportamiento predeterminado del navegador
    if (event.deltaY < 0) {
      scrollbar.value.scrollOffset += mov
      aumenta();
    } else {
      scrollbar.value.scrollOffset -= mov
      disminuye();
    }
  }
}
const scaleReturn = () => {
  scale.value.x = scale_temp.x
  console.log('scale', scale.value.x)
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

watch(sharedData, (newValue) => {
  oraciones.value = newValue
  list_text.value = newValue.flat()

  drawGrid()
  drawRectangles()
})
const convertirTicksATiempo = (ticks, usporquarter, ticksPorNegra) => {
  const tiempoMs = (ticks * usporquarter) / ticksPorNegra / 1000;
  const totalSeconds = Math.floor(tiempoMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(tiempoMs % 1000);

  // Asegúrate de que los valores estén formateados correctamente
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedMilliseconds = String(milliseconds).padStart(3, '0');

  return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
};

const agruparSilabas = (data, grupos) => {
  let agrupado = [];
  let index = 0;

  grupos.forEach(grupo => {
    let startTime = data[index][1];
    console.log('startTime', grupo, data[index][1], data[index][2]);
    let endTime = data[index + grupo.length - 1][2];
    let silabas = grupo.map((silaba, i) => {
      const duracion = data[index + i][2] - data[index + i][1];
      return "{" + `\\k${Math.floor(duracion / 10)}` + "}" + `${silaba}`;
    }).join('');

    agrupado.push({
      silaba: silabas,
      startTime: convertirTicksATiempo(startTime, usporquarter, pasoGrilla.value),
      endTime: convertirTicksATiempo(endTime, usporquarter, pasoGrilla.value)
    });

    index += grupo.length;
  });

  return agrupado;
};

const exptAss = () => {
  let data = exportData()
  console.log('exportar', data);

  if (data.length < oraciones.value.flat().length) {
    alert('No hay suficientes notas para las silabas')
    return
  }
  data = agruparSilabas(data, oraciones.value)


  console.log('exportar', data);
  const assContent = formatAss(data);
  console.log('assContent', assContent);

  // Crear un archivo .ass y descargarlo
  const blob = new Blob([assContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'subtitles.ass';
  link.click();

}
const exptSrt = () => {
  let data = exportData();
  console.log('exportar', data);

  if (data.length < oraciones.value.flat().length) {
    alert('No hay suficientes notas para las silabas');
    return;
  }
  data = agruparSilabasSrt(data, oraciones.value, usporquarter, pasoGrilla.value);

  console.log('exportar', data);
  const srtContent = formatSrt(data);
  console.log('srtContent', srtContent);

  // Crear un archivo .srt y descargarlo
  const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'subtitles.srt';
  link.click();
};
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
      if (event.timeSignature) {
        console.log('timeSignature', event.timeSignature)
      } else if (event.setTempo) {
        usporquarter = event.setTempo.microsecondsPerQuarter
      } else if (event.noteOn) {
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
  return 0 + ((e - 0) * (totalHeight.value - 0)) / (NOTAS_TOTAL.value - 0)
}

function iniciarScroll(channel = 0) {
  const yPos = totalHeight.value - tempTracks[channel][0].nota * height_note.value
  firstposiciony.value = (yPos - height / 2) / scale.value.y
  firstposicionx.value = tempTracks[channel][0].x - 10
  console.log('firstposiciony', firstposicionx.value)
  scrollbar.value.scrollOffset = firstposicionx.value / scale.value.x
  contCanvas.value.scrollTo(firstposicionx.value, firstposiciony.value)
}

onBeforeMount(async () => {
  loadDefaultFile()
})
watch(
  () => arrayBuffer.value,
  (value) => {
    if (value) {
      drawGrid()
      processFile()
    }
  }
)
function convertirATiempo(cont) {
  const t = (cont * usporquarter) / 1000000
  const totalSeconds = Math.floor(t)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((t - totalSeconds) * 1000)

  return `${minutes}:${seconds}.${milliseconds}`
}
watch(
  () => Alltracks.value,
  (value) => {
    if (value) {
      grilla.value = []
      let cont = 0
      for (let x = 0; x <= totalWidth.value; x += pasoGrilla.value) {
        const text = convertirATiempo(cont)
        grilla.value.push({ x: x, text: `${text}` })
        cont++
      }
      rects.value = value[listChannel.value[0]]
      if (totalWidth.value < 10000) {
        scale.value = { x: 1, y: 1 }
      } else {
        const x = 10 * Math.round(totalWidth.value / 10000 / 10)
        console.log('x', x)
        scale_temp.x = x
        scale.value = { x: x, y: 1 }
      }

      contentLength.value = totalWidth.value / scale.value.x
      drawGrid()
      drawRectangles()
      iniciarScroll(listChannel.value[0])
    }
  }
)
let resizeObserver
function handleResize() {
  rCanvas.value.width = contCanvas.value.clientWidth
  gridcanvas.value.style.width = `${contCanvas.value.clientWidth}px`
  drawGrid()
  drawRectangles()
}

onMounted(() => {
  const debouncedHandleResize = debounce(handleResize, 300)
  console.log('anchoTotal', rCanvas.value.width, scale.value.x)
  rCanvas.value.width = contCanvas.value.clientWidth
  gridcanvas.value.style.width = `${contCanvas.value.clientWidth}px`
  console.log('anchoTotal', rCanvas.value.width, scale.value.x)
  rCanvas.value.addEventListener('mousedown', pickClick)
  rCanvas.value.addEventListener('mousemove', pickDrag)
  rCanvas.value.addEventListener('mouseup', pickRelease)
  if (visualization.value) {
    resizeObserver = new ResizeObserver(debouncedHandleResize)
    resizeObserver.observe(visualization.value)
  }
  watch(
    () => scrollbar.value.scrollOffset,
    (value) => {
      offsetX.value = value
      drawGrid()
      drawRectangles()
    }
  )
})
onUpdated(() => { })

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
  min-height: 50vh;
  padding: 0;
  background-color: #f0f0f0;
  height: calc(100% - 58px - 17px - 40px);
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

@media (max-width: 1024px) {
  #visualization {
    width: 100%;
    min-height: 10vh;
    background-color: #f0f0f0;
    flex-grow: 1;
    height: calc(90vh - 58px - 17px - 40px);
  }

  .cuerpo {
    height: 100%;
  }
}
</style>
