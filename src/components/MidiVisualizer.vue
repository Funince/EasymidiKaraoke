<template>
  <div class="cuerpo">
    <div ref="visualization" id="visualization"></div>
  </div>
</template>

<script setup>
import * as d3 from 'd3'
import { parseArrayBuffer } from 'midi-json-parser'
import { ref, onMounted ,onUnmounted, watch} from 'vue'
let visualization = ref(null)
let svg = ref(null);
let arrayBuffer = ref(null);
const color1 = '#8dbf8b'
const color2 = '#fcf1d8'
const color3 = '#fadc9c'
const color4 = '#f09e56'
const color5 = '#9EA492'
let width = 0
let height = 0
let totalHeight = ref(0)
let totalWidth = ref(0)
let g = ref(null)
let midi = ref(null)
let zoom = ref(null)
let scrollbarXValue = ref(0)
let scrollbarYValue = ref(0)
let note_yScale = ref(null)
let firstposiciony = ref(null)
let firstposicionx = ref(null)
let note_width = ref(0.1)
let parent = ref(null)
let body = ref(null)
let height_note = ref(16)
let rect_notes = ref(null)
let drag_notes = ref(null)
let onTextMidi = ref(null)
let Alltracks = ref({})

const props = defineProps({
  dataShared: Array
})

watch(() => props.dataShared, (value) => {
  if(svg.value && g.value){
    value.forEach((item) => {
    item.forEach((note) => {
      onTextMidi.value = g.value.append('g')
      onTextMidi.value
        .append('text')
        .attr('x',100)
        .attr('y',100)
        .text(note)
        .attr('font-family', 'sans-serif')
          .attr('font-size', () => `${120 * note_width.value}px`)
          .attr('fill', 'black')
          .attr('text-anchor', 'start')
    })
  })
  }
  
  
})
function dragstarted(event) {
  console.log('dragstarted')
  d3.select(this).raise().classed('active', true)
}
function dragged(event) {
  console.log('dragged')
  d3.select(this).attr('x', event.x).attr('y', event.y)
}
function dragended(event) {
  console.log('dragended')
  d3.select(this).classed('active', false)
}

function loadDefaultFile() {
  const url1 = '../La_camisa_negra.mid'
  const url2 = '../prueba audio2.mid'
  fetch(url1)
    .then((response) => response.arrayBuffer())
    .then((data) => {
      arrayBuffer.value = data
      processFile()
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
      visualizarMIDI()
      console.log('procesando archivo')
    } catch (error) {
      console.error('Error parsing MIDI file:', error)
    }
  }
}
function initializeSVG() {
  width = visualization.value.clientWidth
  height = visualization.value.clientHeight
  parent.value = d3.create('div')
  body.value = parent.value
    .append('div')
    .style('overflow-x', 'scroll')
    .style('overflow-y', 'scroll')
    .style('width', '100%')
    .style('height', height + 'px')

  svg.value = body.value
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('display', 'block')
    .style('possition', 'absolute')
    .style('top', '0')
    .style('left', '0')
  g.value = svg.value.append('g')
}
function updateSVG() {
  if (!svg.value || !visualization.value) return
  height=visualization.value.clientHeight
  width=visualization.value.clientWidth
  body.value.style('height', height + 'px')
}
function visualizarMIDI() {
   // Altura total basada en el rango de notas MIDI
  totalHeight.value = 128 * height_note.value
  const color_relleno = color4
  // Escala para las notas MIDI
  note_yScale.value = d3
    .scaleLinear()
    .domain([0, 127]) // Rango completo de notas MIDI
    .range([0, totalHeight.value]) // Rango de posiciones verticales
  
  let maxTime = 0

  midi.value.tracks.forEach((track, trackIndex) => {
  
    let currentTime = 0
    const noteEvents = []
        
    // Construir una lista de eventos de notas con duraciones calculadas
    track.forEach((event,index) => {
            
      currentTime += event.delta
      if (event.noteOn) {
        if(!Alltracks.value[event.channel]){
          Alltracks.value[event.channel]=[]
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
            e.noteNumber === event.noteOff.noteNumber &&
            e.channel === event.channel &&
            !e.endTime
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
    totalWidth.value = maxTime * 0.1
    // Dibujar las notas MIDI
    
  noteEvents
    .filter(note => note.endTime)
    .forEach(addItem);
  })
 
 paintNotes()
  zoom.value = d3
    .zoom()
    .scaleExtent([0.5, 8])
    .filter((event) => {
      return (event.type === 'wheel' && event.ctrlKey) || event.type === 'dblclick'
    })
    .wheelDelta((event) => {
      return (
        -event.deltaY *
        (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) *
        (event.ctrlKey ? 1 : 1)
      )
    })
    .on('zoom', zoomed)
  canvas()
}
function addItem(note){
  const index = Alltracks.value[note.channel].length>0?Alltracks.value[note.channel].length:0

  Alltracks.value[note.channel].push({"id":`${index}`,"x":note.startTime,"nota":note.noteNumber,"width": note.duration,"channel":note.channel,"velocity":note.velocity})  
}

function paintNotes(){
  
   
      const yPos = totalHeight.value - note_yScale.value(Alltracks.value[0][0].nota);
      firstposiciony.value = -yPos + height / 2;
      firstposicionx.value = -Alltracks.value[0][0].x * note_width.value;
    rect_notes.value = g.value.append('g')
    Object.keys(Alltracks.value).forEach((key) => {
      const data = Alltracks.value[key]

      rect_notes.value.append('g')
      .attr('id', `track-${key}`)
      
  const group= rect_notes.value.selectAll(`#track-${key}`)
  .data(data, function(d) { return d ? d.name : this.id; })
  .join('g')
  .attr('id', (d) => d.id)


  group.append("rect")
  .attr('x', (d) => d.x * note_width.value)
  .attr('y', (d) => totalHeight.value - note_yScale.value(d.nota))
  .attr('width', (d) => d.width * note_width.value)
  .attr('height', height_note.value)
  .attr('fill', color4)
  .attr('stroke', 'black')
  .attr('stroke-width', '1px')
  
  group.append('text')
  .attr('x', (d) => (d.x + 2) * note_width.value)
  .attr('y', (d) => totalHeight.value - note_yScale.value(d.nota)-2 + height_note.value)
  .text((d) => getNoteName(d.nota))
  .attr('font-family', 'sans-serif')
  .attr('font-size', () => `${120 * note_width.value}px`)
  .attr('fill', 'black')
  .attr('text-anchor', 'start')
    })
/*    
        rect_notes.value
          .append('text')
          .attr('x', (note.startTime + 2) * note_width.value) // Ajustar la escala de tiempo para la visualización
          .attr('y', yPos - 2 + height_note.value) // Posición vertical del texto debajo de la nota
          .text(noteName)
          .attr('font-family', 'sans-serif')
          .attr('font-size', () => `${120 * note_width.value}px`)
          .attr('fill', 'black')
          .attr('text-anchor', 'start') */
   
  }
function getNoteName(noteNumber) {
    const noteNames = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B'
    ]
    const octave = Math.floor(noteNumber / 12) - 1
    const noteName = noteNames[noteNumber % 12]

    return `${noteName}${octave}`
  }
function canvas() {
  const whitecolor = color1
  const blackcolor = color5
  const nestedGroup = g.value.append('g')
  const rectHeight = height_note.value
  const blackKeys = new Set([1, 3, 6, 8, 10])
  for (let i = 0; i < 128; i++) {
    const noteInOctave = i % 12
    const color = blackKeys.has(noteInOctave) ? blackcolor : whitecolor
    nestedGroup
      .append('rect')
      .attr('x', 0)
      .attr('y', totalHeight.value - note_yScale.value(i))
      .attr('width', totalWidth.value)
      .attr('height', rectHeight)
      .style('fill', color)
      .style('opacity', '0.8')
      .style('stroke', 'white')
      .style('stroke-width', '0.3px')
  }
  nestedGroup.lower()
  svg.value.attr('width',totalWidth.value).attr('height', totalHeight.value)
  visualization.value.appendChild(parent.value.node())
  body.value.node().scrollBy(-firstposicionx.value, -firstposiciony.value)
  svg.value.on('dblclick', zoom_dblclick)
  svg.value.call(zoom.value).on('dblclick.zoom', null)
  drag_notes.value = d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
  rect_notes.value.selectAll('*').call(drag_notes.value)
}
function zoom_dblclick(event) {
  const transform = d3.zoomTransform(svg.value.node())
  let factor = 2
  let scale = transform.k * factor
  let [x, y] = d3.pointer(event)
  if (scale > 8) {
    scale = 1
    factor = 1 / 8
  }
  console.log('dblclick1',width,height)
  x = x * factor - width / 2
  y = y * factor - height / 2
  const newTransform = d3.zoomIdentity.translate(0, 0).scale(scale)
  scrollbarXValue.value = x
  scrollbarYValue.value = y
  console.log('dblclick2', x, y)
  svg.value.transition().duration(500).call(zoom.value.transform, newTransform)
}
function zoomed(event) {
  const { transform } = event
  svg.value
    .attr('height', totalHeight.value * transform.k)
    .attr('width', totalWidth.value * transform.k)
  if (event.sourceEvent === null) {
    g.value.attr('transform', transform)
    body.value.node().scrollTo(scrollbarXValue.value, scrollbarYValue.value)
  }
  else {
    if (event.sourceEvent.type === 'wheel' && event.sourceEvent.ctrlKey) {
      body.value.node().scrollBy(-transform.x, -transform.y)
      transform.x = 0
      transform.y = 0
      g.value.attr('transform', transform)
      console.log('pasa')
    }
  }
}
onMounted(()=>{
  
  loadDefaultFile()
  window.addEventListener(
    'resize',
    () => {
      console.log('resized')
      updateSVG()
    }
  )
})

onUnmounted(()=>{
  window.removeEventListener('resize',updateSVG())
}) 
</script>

<style>
#app,
.cuerpo {
  width: 100%;
  height: 100%;
  margin: 0;
}

.cuerpo {
  flex-direction: column;
  padding-right: 2px;
}

.interfaz {
  height: 100%;
  padding-bottom: 2px;
  padding-top: 2px;
  display: flex;
  flex-direction: column;

  justify-content: space-between;
  min-height: 50vh;
  max-height: 90vh;
}

#visualization {
  width: 100%;
  height: 100%;
  position: relative;
  min-height: 50vh;
  padding: 0;
  background-color: var(--color-1);
}

@media (max-width: 1900px) {
  #visualization {
    width: 100%;
    min-height: 60vh;
    background-color: var(--color-1);
    max-height:90vh;
  }
}
</style>
