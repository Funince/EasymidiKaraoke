<template>
  <ColorPickerModal :isVisible="isColorPickerVisible" :format="currentFormat" @accept="handleExport"
    @cancel="hideColorPicker" />

  <div tabindex="3" @keydown.ctrl.up="aumenta" @keydown.ctrl.down="disminuye" class="cuerpo"
    @contextmenu.prevent="showContextMenu">
    <slot>
      <BarraMenu :listChannel="listChannel" @SelectChannel="seleccion" @aumenta="aumenta" @disminuye="disminuye"
        @exptAss="showColorPicker" @exptSrt="showColorPicker" @fileSelect="handleFileUpload" @undo="undo"
        @exportMidi="exportMidi" :isFileLoaded="isFileLoaded" />
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
  <ContextMenu ref="contextMenu" @action="handleContextMenuAction" />

</template>

<script setup>
import { convertirTicksATiempo, convertirATiempo } from '@/components/utils/timeUtils';

import { formatSrt, agruparSilabasSrt, formatSrtcolor } from '@/components/utils/formatSrt';
import formatAss from '@/components/utils/formatAss.js';
import { mdiPlusCircle, mdiMinusCircle, mdiAlbum } from '@mdi/js'
import { debounce, clamp } from 'lodash'
import { parseArrayBuffer } from 'midi-json-parser'
import { toRefs, ref, onMounted, onBeforeMount, onUnmounted, watch, onUpdated, computed, defineAsyncComponent } from 'vue'
import { paintCanvas } from '@/components/utils/paintCanvas.js'
import { processMidi } from '@/components/utils/midiProcessor.js';
import { exportRectsToMidi } from '@/components/utils/formatMidi.js'
import { usePlayerStore } from '@/stores/playerStore'

const store = usePlayerStore()

const totalWidth = ref(0) // Define totalWidth
let height_note = ref(16)
let NOTAS_TOTAL = ref(128)
const usporquarter = ref(0)
const isFileLoaded = ref(false) // Track if a file is loaded
const {
  undoHistory,
  gridcanvas,
  stripeCanvas,
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
  exportData,
  setMode,
  undo, // Add undo function
} = paintCanvas(height_note.value, NOTAS_TOTAL.value, '#f0f0f0', '#e0e0e0', totalWidth, usporquarter)

const listChannel = ref([])
let visualization = ref(null)
let arrayBuffer = ref(null)
const contentLength = ref(0)
const scrollbar = ref(null)
const contCanvas = ref(null)

let scale_temp = { x: 1, y: 1 }
const selectedColor = ref('#ff5500');
const color1 = '#8dbf8b'
const color2 = '#fcf1d8'
const color3 = '#fadc9c'
const color4 = '#f09e56'
const color5 = '#9EA492'
let width = 0
let height = 0
let totalHeight = ref(0)
let midi = ref(null)
let firstposiciony = ref(null)
let firstposicionx = ref(null)
let body = ref(null)

let tempTracks = {}
let oraciones = ref([])
const Alltracks = ref({})
const props = defineProps({
  sharedData: Array
})
const { sharedData } = toRefs(props)
const isColorPickerVisible = ref(false);
const mouseX = ref(0);
const currentFormat = ref('');

const SvgIcon = defineAsyncComponent(() => import('@jamescoyle/vue-icon'))
const BarraMenu = defineAsyncComponent(() => import('@/components/BarraMenu.vue'))
const BarraScroll = defineAsyncComponent(() => import('@/components/BarraScroll.vue'))
const ColorPickerModal = defineAsyncComponent(() => import('@/components/ColorPickerModal.vue'))
const ContextMenu = defineAsyncComponent(() => import('@/components/ContextMenu.vue'))

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
const contextMenu = ref(null);

const showContextMenu = (event) => {
  contextMenu.value.showMenu(event);
};



const handleContextMenuAction = (action) => {
  if (action === 'cut' || action === 'move' || action === 'draw' || action === 'view' || action === 'delete') {
    setMode(action);
  }
};
watch(sharedData, (newValue) => {
  oraciones.value = newValue
  list_text.value = newValue.flat()

  drawGrid()
  drawRectangles()
})

const agruparSilabas = (data, grupos) => {
  let agrupado = [];
  let index = 0;

  grupos.forEach(grupo => {
    let startTime = data[index][1];
    console.log('startTime', grupo, data[index][1], data[index][2]);
    let endTime = data[index + grupo.length - 1][2];
    let silabas = grupo.map((silaba, i) => {
      const duracion = (data[index + i][2] - data[index + i][1]) * usporquarter.value / pasoGrilla.value / 1000;
      console.log('duracion', data[index + i][1]);
      return "{" + `\\k${Math.floor(duracion / 10)}` + "}" + `${silaba}`;
    }).join('');

    agrupado.push({
      silaba: silabas,
      startTime: convertirTicksATiempo(startTime, usporquarter.value, pasoGrilla.value),
      endTime: convertirTicksATiempo(endTime, usporquarter.value, pasoGrilla.value)
    });

    index += grupo.length;
  });

  return agrupado;
};

const exptAss = ({ color, isColorEnabled, delay }) => {
  hideColorPicker();
  let data = exportData();
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }
  if (data.length < oraciones.value.flat().length) {
    alert('There are not enough notes for the syllables')
    return
  }
  data = agruparSilabas(data, oraciones.value)
  const assContent = formatAss(data, delay);

  // Create and download .ass file
  const blob = new Blob([assContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'subtitles.ass';
  link.click();
}

const exptSrt = ({ color, isColorEnabled, delay, anticipation_time, maxVisibleSentences, baseColor }) => {
  let srtContent;
  hideColorPicker();
  let data = exportData();
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }
  if (data.length < oraciones.value.flat().length) {
    alert('No hay suficientes notas para las silabas');
    return;
  }
  data = agruparSilabasSrt(data, oraciones.value, usporquarter.value, pasoGrilla.value);

  if (isColorEnabled) {
    srtContent = formatSrtcolor(data, color, delay, anticipation_time, maxVisibleSentences, baseColor);
  } else {
    srtContent = formatSrt(data, delay, baseColor);
  }

  // Crear un archivo .srt y descargarlo
  const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'subtitles.srt';
  link.click();
};
// async function loadDefaultFile() {
//   const url1 = '../La_camisa_negra.mid'
//   const url2 = '../prueba audio2.mid'
//   fetch(url1)
//     .then((response) => response.arrayBuffer())
//     .then((data) => {
//       arrayBuffer.value = data
//     })
// }
function handleFileUpload(file) {
  if (file) {
    console.log('file', file)
    const reader = new FileReader()
    reader.onload = (e) => {
      arrayBuffer.value = e.target.result
    };
    reader.readAsArrayBuffer(file);
    isFileLoaded.value = true // Set file loaded flag
  }
}
async function processFile() {
  tempTracks = {}
  if (arrayBuffer.value) {
    try {
      const clonedArrayBuffer = arrayBuffer.value.slice(0)
      midi.value = await parseArrayBuffer(clonedArrayBuffer)
      initializeSVG()
      console.log('procesando archivo')
      const result = processMidi(midi.value, height_note, tempTracks);
      pasoGrilla.value = result.pasoGrilla;
      totalHeight.value = result.totalHeight;
      totalWidth.value = result.maxTime;
      usporquarter.value = result.usporquarter;
      console.log('usporquarteaaar', usporquarter.value)
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


function iniciarScroll(channel = 0) {
  const yPos = totalHeight.value - tempTracks[channel][0].nota * height_note.value
  firstposiciony.value = (yPos - height / 2) / scale.value.y
  firstposicionx.value = tempTracks[channel][0].x - 10
  console.log('firstposiciony', firstposicionx.value)
  scrollbar.value.scrollOffset = firstposicionx.value / scale.value.x
  contCanvas.value.scrollTo(firstposicionx.value, firstposiciony.value)
}

// onBeforeMount(async () => {
//   loadDefaultFile()
// })
watch(arrayBuffer, (value) => {
  if (value) {
    drawGrid();
    processFile();
  }
});

watch(
  () => Alltracks.value,
  (value) => {
    if (value) {
      grilla.value = []
      let cont = 0
      for (let x = 0; x <= totalWidth.value; x += pasoGrilla.value) {
        const text = convertirATiempo(cont, usporquarter.value)
        grilla.value.push({ x: x, text: `${text}` })
        cont++
      }
      rects.value = value[listChannel.value[0]]
      undoHistory.value = []
      console.log("total", totalWidth.value)
      if (totalWidth.value < 10000) {
        scale.value = { x: 1, y: 1 }
      } else { //sirve para que el zoom sea proporcional al ancho del canvas
        const t = Math.round(totalWidth.value / 10000 / 10) || 1
        const x = 10 * t
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
  stripeCanvas.value.width = contCanvas.value.clientWidth
  stripeCanvas.value.height = contCanvas.value.clientHeight
  drawGrid()
  drawRectangles()
}
const debouncedHandleMouseMove = debounce((event) => {
  mouseX.value = event.clientX
}, 0.2);
onMounted(() => {
  const debouncedHandleResize = debounce(handleResize, 300)
  console.log('anchoTotal', rCanvas.value.width, scale.value.x)
  rCanvas.value.width = contCanvas.value.clientWidth
  gridcanvas.value.style.width = `${contCanvas.value.clientWidth}px`
  stripeCanvas.value.width = contCanvas.value.clientWidth
  stripeCanvas.value.height = contCanvas.value.clientHeight
  console.log('anchoTotal', rCanvas.value.width, scale.value.x)
  rCanvas.value.addEventListener('mousedown', pickClick)
  rCanvas.value.addEventListener('mousemove', pickDrag)
  rCanvas.value.addEventListener('mouseup', pickRelease)
  rCanvas.value.addEventListener('mousemove', debouncedHandleMouseMove);

  if (visualization.value) {
    resizeObserver = new ResizeObserver(debouncedHandleResize)
    resizeObserver.observe(visualization.value)
  }
  // Sync the scrollbar with the canvas scroll offset
  watch(
    () => offsetX.value,
    (value) => {
      if (scrollbar.value) {
        scrollbar.value.scrollOffset = value;
      }
    }
  );
  watch(
    () => scrollbar.value.scrollOffset,
    (value) => {
      offsetX.value = value
      drawGrid()
      drawRectangles()
    }
  )
  // Warn before closing or refreshing the page
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  rCanvas.value.removeEventListener('mousemove', debouncedHandleMouseMove);
  debouncedHandleMouseMove.cancel(); // Clean up debounce
  window.removeEventListener('beforeunload', handleBeforeUnload)
});

function handleBeforeUnload(event) {
  if (isFileLoaded.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onUpdated(() => { })

function exportMidi() {
  const midiData = exportRectsToMidi(rects.value, store.tempo, usporquarter.value, pasoGrilla.value)
  const blob = new Blob([midiData], { type: 'audio/midi' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'exported.mid'
  link.click()
}

const showColorPicker = (format) => {
  currentFormat.value = format;
  isColorPickerVisible.value = true;
};

const hideColorPicker = () => {
  isColorPickerVisible.value = false;
};

const handleExport = (options) => {
  if (currentFormat.value === 'ass') {
    exptAss(options);
  } else {
    exptSrt(options);
  }
}

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

.cuerpo {
  cursor: default;
}

.cuerpo.cut-mode {
  cursor: crosshair;
}

.cuerpo.move-mode {
  cursor: move;
}

.cuerpo.draw-mode {
  cursor: cell;
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


.current-time {
  position: absolute;
  color: black;
  top: 90px;
  left: -10px;
  padding: 5px;
  z-index: 1000;
}
</style>
