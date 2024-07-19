<template>
  <div class="zoom-menu">
    <button @click="zoomIn">Zoom In</button>
    <button @click="zoomOut">Zoom Out</button>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: ['svgId'], // Propiedad para recibir el id del SVG

  data() {
    return {
      svg: null, // Inicializar svg como nulo
      zoom: null, // Inicializar zoom como nulo
      x:0,
      y:0,
      k:1,
      g:null
    };
  },

  methods: {
    
    zoomed(event) {
      
      const { transform } = event;
     
      
    

      console.log(transform);
      
      this.g.attr("transform",transform);
    }
  },

  mounted() {
    // Esperar a que Vue.js monte completamente el componente
    this.$nextTick(() => {
      this.svg = d3.select(`#${this.svgId}`); // Seleccionar el SVG con el id recibido
      if (this.svg) {
        this.zoom = d3.zoom().scaleExtent([0.2,8 ]).on("zoom", this.zoomed); // Crear un objeto zoom
      }
      this.svg.attr('viewBox', '0 0 400 300')
      .attr('width', '400')
        .attr('height', '300')
        .attr("style","max-width:100%;height:auto;");
        this.g = this.svg.append('g');
        this.g.append('circle')
        .attr('cx', 200)
        .attr('cy', 150)
        .attr('r', 50)
        .attr('fill', 'red');
        
      this.svg.call(this.zoom); // Aplicar el zoom al SVG
    });
  }
};
</script>

<style scoped>
.zoom-menu {

  top: 10px;
  left: 10px;
}
</style>

