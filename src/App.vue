<template>
  <h1>EASYKARAOKE</h1>
  <div class="container">
    <div class="content" style="width: 80%;">
      <MidiVisualizer />
    </div>
    <div class="content" style="width: 20%;">
      <inputtext/>
    </div>
  </div>
  <div>
    <!-- <scroll /> -->
  </div>

  <!--   <div>
    <svg id="svg1" width="400" height="300" viewBox="0 0 400 300">
     
      <circle cx="200" cy="150" r="50" fill="blue" />
    </svg>
    <estilogrilla svgId="svg1" />
  </div> 
--></template>

<script>
import MidiVisualizer from './components/MidiVisualizer.vue'
import estilogrilla from './components/estilogrilla.vue'
import inputtext from './components/inputtext.vue'
import scroll from './components/scroll.vue'
export default {
  name: 'App',
  components: {
    MidiVisualizer,
    estilogrilla,
    inputtext,
    scroll
  }
}
</script>

<style>
/* Agrega estilos globales si es necesario */
html, body {  
   margin:0px;  
   height:100%;  
 }  
.container {
  width: 100%;
  height: 100%;
  display: flex; /* Usamos flexbox en el contenedor principal */
  justify-content:flex-end; /* Distribuye los elementos a lo largo del contenedor */
  align-items: flex-start; /* Alinea los elementos arriba */
}
.content {
  height: 100%;
  padding: 5px; /* Espaciado interno */
}
</style>
