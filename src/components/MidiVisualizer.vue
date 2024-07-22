<template>
  <div class="cuerpo">

    <!--  <input type="file" @change="handleFileUpload" accept=".mid,.midi">
    <button @click="processFile" :disabled="!file">Procesar Archivo MIDI</button>
  -->

    <div class="interfaz">
      <div id="bloqueA" >
        <div id="visualization"></div>
      
      <input type="range" id="scrollbar-x" min="0" max="1000" v-model="scrollbarXValue" @input="handleScrollX">
    
    </div>
      

    </div>
    <div class="interfaz">
      <input type="range" id="scrollbar-y" orient="vertical" min="0" max="1000" v-model="scrollbarYValue"
        @input="handleScrollY">
    </div>

  </div>
</template>

<script>
import * as d3 from 'd3'
import { parseArrayBuffer } from 'midi-json-parser'
import { ref, computed } from 'vue'
export default {
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
          this.visualizarMIDI()
          console.log("procesando archivo");
        } catch (error) {
          console.error('Error parsing MIDI file:', error)
        }
      }
    },
    initializeSVG() {
      const visualizationContainer = document.getElementById('visualization');
      this.width = visualizationContainer.clientWidth;
      this.height = visualizationContainer.clientHeight;

      if (!this.svg) {
        this.svg = d3.select(visualizationContainer)
          .append('svg')
          .attr('width', this.width)
          .attr('height', 128*16 )
       


        this.g = this.svg.append('g')/* .attr('transform', this.currentTransform) */
        console.log("inicializando svg",this.totalWidth);
      }
    },

    updateSVG() {
      if (!this.svg) return;

      this.svg
      .attr('width', this.width)
      .attr('height', this.limitup)
  

      // Aquí puedes actualizar el contenido del SVG
      // Luego, vuelve a dibujar el contenido
      // Llama a tu función de visualización
    },

    visualizarMIDI() {
      const midi = this.midi

      const heigh_note = 16
      const canvaheight = 128 * heigh_note // Altura total basada en el rango de notas MIDI
      this.totalHeight = canvaheight
      const color_relleno = this.color4


      // Escala para las notas MIDI
      const note_yScale = d3.scaleLinear()
        .domain([0, 127]) // Rango completo de notas MIDI
        .range([0, canvaheight]) // Rango de posiciones verticales
      this.note_yScale = note_yScale

      let maxTime = 0;
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
              maxTime = currentTime;
            }
          }

        })


        // Dibujar las notas MIDI
        noteEvents.forEach((note) => {
          if (note.endTime) {
            const noteName = getNoteName(note.noteNumber) // Función para obtener el nombre de la nota (Do, Re, Mi, etc.)           
            const yPos = canvaheight - note_yScale(note.noteNumber) // Posición vertical basada en la nota MIDI
            if (this.firstposiciony == null && this.firstposicionx == null) {
              this.firstposiciony = -yPos + this.height / 2;
              this.firstposicionx = -note.startTime * this.note_width ;

            }
            this.g
              .append('rect')
              .attr('x', note.startTime * this.note_width) // Ajustar la escala de tiempo para la visualización
              .attr('y', yPos) // Posición vertical basada en la nota MIDI
              .attr('width', note.duration * this.note_width) // Duración de la nota ajustada a la escala
              .attr('height', heigh_note) // Altura de la nota
              .attr('fill', color_relleno) // Color de relleno
              .attr('stroke', 'black') // Color del borde
              .attr('stroke-width', '1px') // Ancho del borde

            this.g
              .append('text')
              .attr('x', (note.startTime + 2) * this.note_width) // Ajustar la escala de tiempo para la visualización
              .attr('y', yPos - 2 + heigh_note) // Posición vertical del texto debajo de la nota
              .text(noteName)
              .attr('font-family', 'sans-serif')
              .attr('font-size', d => `${120 * this.note_width}px`)
              .attr('fill', 'black')
              .attr('text-anchor', 'start')
          }
        })


      })
      this.totalWidth = maxTime * 0.1
    
      this.zoom = d3.zoom().scaleExtent([0.2, 8])
        .extent([[0, 0], [this.width, this.height]])
        .translateExtent([[0, 0], [this.totalWidth, canvaheight]])
        .on("zoom", this.zoomed);
      this.xscale = d3.scaleLinear()
        .domain([0, 1000])
        .range([0, this.totalWidth - this.width])
      this.yScale = d3.scaleLinear()
        .domain([0, 1000])
        .range([canvaheight - this.height,0 ])
      this.limitright = this.totalWidth - this.width;
      this.limitup = canvaheight - this.height;
      this.canvas(canvaheight, heigh_note, this.totalWidth)
      if (this.firstposiciony != null && this.firstposicionx != null && this.firstposicion == null) {
        this.currentTransform.x = this.firstposicionx;
        this.currentTransform.y = this.firstposiciony;
        let movex = this.xscale.invert(-this.firstposicionx);
        let movey = this.yScale.invert(-this.firstposiciony);
        this.scrollbarXValue = Math.floor(movex);
        this.scrollbarYValue = Math.floor(movey);
        this.firstposicion = true;
        this.g.attr("transform", this.currentTransform);
      }
      this.svg.call(this.zoom);
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
      const nestedGroup = this.g.append("g");
      const rectHeight = altura
      const rectY = 0
      const blackKeys = new Set([1, 3, 6, 8, 10]);
      for (let i = 0; i < 128; i++) {
        const noteInOctave = i % 12;
        const color = blackKeys.has(noteInOctave) ? blackcolor : whitecolor;

        nestedGroup
          .append('rect')
          .attr('x', 0)
          .attr('y', (canvaheight - this.note_yScale(i)))
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .style('fill', hexToRgba(color, 0.5))
          .style('stroke', 'white')
          .style('stroke-width', '0.02px')
      }

      nestedGroup.lower();


    },

    zoomed(event) {
      const { transform } = event;

      this.currentTransform = transform;
      this.limitright = this.totalWidth * transform.k - this.width;
      this.limitup = this.totalHeight * transform.k - this.height;


      this.xscale
        .domain([0, 1000])
        .range([0, this.limitright])
      this.yScale
        .domain([0, 1000])
        .range([this.limitup, 0])
      let movex = this.xscale.invert(-transform.x);
      let movey = this.yScale.invert(-transform.y);
      this.scrollbarXValue = Math.floor(movex);
      this.scrollbarYValue = Math.floor(movey);
      this.g.attr("transform", transform);
      console.log("zoomed");

    },
    handleScrollX(event) {
      const transform = this.currentTransform;
      let movex = this.xscale(this.scrollbarXValue);
      transform.x = -movex;
      this.g.attr("transform", this.currentTransform);

    },
    handleScrollY(event) {
      const transform = this.currentTransform;
      let movey = this.yScale(this.scrollbarYValue);
      transform.y = -movey;
      this.g.attr("transform", this.currentTransform);
      console.log(this.scrollbarYValue, movey);
    },
  },
  mounted() {
    this.loadDefaultFile();
    this.visualizationContainer = document.getElementById('visualization');
    this.initializeSVG();

   


    window.addEventListener('resize', () => {
      this.width = this.visualizationContainer.clientWidth;
      this.height = this.visualizationContainer.clientHeight;
      this.visualizarMIDI();
      this.updateSVG();
      console.log('me estoy redimensionando');
    });
  }

}

function hexToRgba(hex, alpha) {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length == 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return `rgba(${r},${g},${b},${alpha})`;
}

</script>

<style>
#app,
.cuerpo {
  width: 100%;
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 1%;
  
}
.cuerpo {
 
  display: grid;
  grid-template-columns: 100% 2px;
}

.interfaz {
  height: 100%;
  padding-bottom: 2px;
  padding-top: 2px;
}

#visualization {
  height: 100px;
  width: 100px;
  min-height: 20em;
  border: 1px solid black;
  background-color: var(--color-1);
}

#bloqueA {
  overflow: scroll;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
    border: 1px solid black;
    background-color: var(--color-1);
  }
  

}
</style>
