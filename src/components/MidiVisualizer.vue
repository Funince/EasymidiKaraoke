<template>
  <div class="cuerpo">
    <div ref="visualization" id="visualization"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { parseArrayBuffer } from 'midi-json-parser'
import { ref, computed } from 'vue'

export default {
  components: {},
  data() {
    return {
      contentHeight: 800,
      svg: null,
      file: null,
      arrayBuffer: null,
      color1: '#8dbf8b',
      color2: '#fcf1d8',
      color3: '#fadc9c',
      color4: '#f09e56',
      color5: '#9EA492',
      width: 0,
      height: 0,
      totalHeight: 0,
      totalWidth: 0,
      g: null,
      midi: null,
      zoom: null,
      scrollbarXValue: ref(0),
      scrollbarYValue: ref(1000),
      note_yScale: null,
      firstposiciony: null,
      firstposicionx: null,
      firstposicion: 1,
      currentTransform: d3.zoomIdentity,
      xscale: null,
      yScale: null,
      limitright: 0,
      limitup: 0,
      note_width: 0.1,
      container: null,
      parent: null,
      body: null,
      height_note: 16
    }
  },
  methods: {
    loadDefaultFile() {
      const url = '../prueba audio2.mid'
      fetch(url)
        .then((response) => response.arrayBuffer())
        .then((data) => {
          this.arrayBuffer = data
          this.processFile()
        })
    },
    handleFileUpload(event) {
      this.file = event.target.files[0]
      if (this.file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.arrayBuffer = e.target.result
        }
        reader.readAsArrayBuffer(this.file)
      }
    },
    async processFile() {
      if (this.arrayBuffer) {
        try {
          const clonedArrayBuffer = this.arrayBuffer.slice(0)
          const midi = await parseArrayBuffer(clonedArrayBuffer)
          /* console.log(midi) // Ver la estructura del JSON en la consola
           */
          this.midi = midi

          this.initializeSVG()
          this.visualizarMIDI()
          console.log('procesando archivo')
        } catch (error) {
          console.error('Error parsing MIDI file:', error)
        }
      }
    },
    initializeSVG() {
      this.width = this.container.clientWidth
      this.height = this.container.clientHeight
      this.parent = d3.create('div')
      this.body = this.parent
        .append('div')
        .style('overflow-x', 'scroll')
        .style('overflow-y', 'scroll')
        .style('width', '100%')
        .style('height', this.height + 'px')

      this.svg = this.body
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .style('display', 'block')
        .style('possition', 'absolute')
        .style('top', '0')
        .style('left', '0')
      this.g = this.svg.append('g')
    },

    updateSVG() {
      if (!this.svg) return
      this.body.style('height', this.height + 'px')
      console.log('actualizando svg', this.height)
      // Aquí puedes actualizar el contenido del SVG
      // Luego, vuelve a dibujar el contenido
      // Llama a tu función de visualización
    },

    visualizarMIDI() {
      const midi = this.midi
      this.heigh_note = 16
      const canvaheight = 128 * this.heigh_note // Altura total basada en el rango de notas MIDI
      this.totalHeight = canvaheight
      const color_relleno = this.color4
      // Escala para las notas MIDI
      const note_yScale = d3
        .scaleLinear()
        .domain([0, 127]) // Rango completo de notas MIDI
        .range([0, canvaheight]) // Rango de posiciones verticales
      this.note_yScale = note_yScale

      let maxTime = 0
      midi.tracks.forEach((track, trackIndex) => {
        let currentTime = 0
        const noteEvents = []

        // Construir una lista de eventos de notas con duraciones calculadas
        track.forEach((event) => {
          currentTime += event.delta
          if (event.noteOn) {
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
        this.totalWidth = maxTime * 0.1
        // Dibujar las notas MIDI
        noteEvents.forEach((note) => {
          if (note.endTime) {
            const noteName = getNoteName(note.noteNumber) // Función para obtener el nombre de la nota (Do, Re, Mi, etc.)
            const yPos = canvaheight - note_yScale(note.noteNumber) // Posición vertical basada en la nota MIDI
            if (this.firstposiciony == null && this.firstposicionx == null) {
              this.firstposiciony = -yPos + this.height / 2
              this.firstposicionx = -note.startTime * this.note_width
            }
            this.g
              .append('rect')
              .attr('x', note.startTime * this.note_width) // Ajustar la escala de tiempo para la visualización
              .attr('y', yPos) // Posición vertical basada en la nota MIDI
              .attr('width', note.duration * this.note_width) // Duración de la nota ajustada a la escala
              .attr('height', this.heigh_note) // Altura de la nota
              .attr('fill', color_relleno) // Color de relleno
              .attr('stroke', 'black') // Color del borde
              .attr('stroke-width', '1px') // Ancho del borde

            this.g
              .append('text')
              .attr('x', (note.startTime + 2) * this.note_width) // Ajustar la escala de tiempo para la visualización
              .attr('y', yPos - 2 + this.heigh_note) // Posición vertical del texto debajo de la nota
              .text(noteName)
              .attr('font-family', 'sans-serif')
              .attr('font-size', (d) => `${120 * this.note_width}px`)
              .attr('fill', 'black')
              .attr('text-anchor', 'start')
          }
        })
      })
      this.zoom = d3
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
        .on('zoom', this.zoomed)
      this.xscale = d3
        .scaleLinear()
        .domain([0, 1000])
        .range([0, this.totalWidth - this.width])
      this.yScale = d3
        .scaleLinear()
        .domain([0, 1000])
        .range([canvaheight - this.height, 0])
      this.limitright = this.totalWidth - this.width
      this.limitup = canvaheight - this.height
      this.canvas(canvaheight, this.heigh_note, this.totalWidth)
      function getNoteName(noteNumber) {
        const noteNames = [
          'Do',
          'Do#',
          'Re',
          'Re#',
          'Mi',
          'Fa',
          'Fa#',
          'Sol',
          'Sol#',
          'La',
          'La#',
          'Si'
        ]
        const octave = Math.floor(noteNumber / 12) - 1
        const noteName = noteNames[noteNumber % 12]

        return `${noteName}${octave}`
      }
    },
    canvas(canvaheight, altura, rectWidth) {
      const whitecolor = this.color1
      const blackcolor = this.color5
      const nestedGroup = this.g.append('g')
      const rectHeight = altura
      const rectY = 0
      const blackKeys = new Set([1, 3, 6, 8, 10])
      for (let i = 0; i < 128; i++) {
        const noteInOctave = i % 12
        const color = blackKeys.has(noteInOctave) ? blackcolor : whitecolor

        nestedGroup
          .append('rect')
          .attr('x', 0)
          .attr('y', canvaheight - this.note_yScale(i))
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .style('fill', color)
          .style('opacity', '0.8')
          .style('stroke', 'white')
          .style('stroke-width', '0.02px')
      }

      nestedGroup.lower()
      this.svg.attr('width', this.totalWidth).attr('height', canvaheight)
      this.$refs.visualization.appendChild(this.parent.node())
      this.body.node().scrollBy(-this.firstposicionx, -this.firstposiciony)
      this.svg.call(this.zoom)
    },

    zoomed(event) {
      const { transform } = event

      this.currentTransform = transform
      this.limitright = this.totalWidth * transform.k - this.width
      this.limitup = this.totalHeight * transform.k - this.height
      this.xscale.domain([0, 1000]).range([0, this.limitright])
      this.yScale.domain([0, 1000]).range([this.limitup, 0])
      let movex = this.xscale.invert(-transform.x)
      let movey = this.yScale.invert(-transform.y)
      this.scrollbarXValue = Math.floor(movex)
      this.scrollbarYValue = Math.floor(movey)
      console.log('previo', transform.x, transform.y, transform.k)
      console.log(event)
      if (event.sourceEvent.type === 'wheel' && event.sourceEvent.ctrlKey) {
        this.body.node().scrollBy(-transform.x, -transform.y)
        transform.x = 0
        transform.y = 0
        this.svg
          .attr('height', this.totalHeight * transform.k)
          .attr('width', this.totalWidth * transform.k)
        this.g.attr('transform', transform)
        console.log('pasa')
      } else if (event.sourceEvent.type === 'dblclick') {
        let x = -transform.x / 6
        console.log('este es el ancho:', this.totalHeight * transform.k)
        let temporal = ((this.totalHeight + this.height - this.height_note ** 2) * transform.k) / 4
        let y = (temporal + transform.y) / 12
        /* let y=((this.totalHeight*transform.k-20)/-transform.y-10)*2*transform.k
         */
        console.log('dblclick', x, y)
        if (y > 0 && x > 0) {
          this.body.node().scrollBy(x, y)
          transform.x = 0
          transform.y = 0
          this.svg
            .attr('height', this.totalHeight * transform.k)
            .attr('width', this.totalWidth * transform.k)
          this.g.attr('transform', transform)
          console.log('pasa algo')
        }
      } else {
        console.log('no pasa nada')
      }
    },
    handleScrollX(event) {
      const transform = this.currentTransform
      let movex = this.xscale(this.scrollbarXValue)
      transform.x = -movex
      this.g.attr('transform', this.currentTransform)
    },
    handleScrollY(event) {
      const transform = this.currentTransform
      let movey = this.yScale(this.scrollbarYValue)
      transform.y = -movey
      this.g.attr('transform', this.currentTransform)
      console.log(this.scrollbarYValue, movey)
    },
    resized() {
      this.width = this.container.clientWidth
      this.height = this.container.clientHeight
      this.updateSVG()
    }
  },

  mounted() {
    this.container = this.$refs.visualization
    this.loadDefaultFile()

    window.addEventListener(
      'resize',
      () => {
        console.log('resized')
        this.resized()
      }
      /* this.resized(); */
    )
  },
  beforeUnmount() {
    // Elimina el listener del evento resize
    window.removeEventListener('resize', this.resized())
  }
}
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
  max-height: 90vh;
}

#visualization {
  width: 100%;
  height: 100%;
  position: relative;
  min-height: 240px;
  padding: 0;
  background-color: var(--color-1);
}

.scroller {
  width: 100%;
  height: 100%;
  display: flex;
  flex: 10px;
}

input {
  display: flex;
}

#scrollbar-y {
  right: 0;
  top: 0;
  width: 20px;
  /* Ancho del scrollbar */
  height: 100%;
  /* Altura del scrollbar */
  writing-mode: bt-lr;
  /* Rotación para hacerlo vertical */
  appearance: slider-vertical;
}

#scrollbar-x {
  width: 100%;
  height: 20px;
}

button {
  margin-top: 10px;
}

@media (max-width: 1900px) {
  #visualization {
    width: 100%;

    min-height: 20em;
    background-color: var(--color-1);
    max-height: 100%;
  }
}
</style>
