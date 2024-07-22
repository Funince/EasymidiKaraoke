<template>
  <div class="title">
    <h1>EASYKARAOKE</h1>
  </div>
  <div class="container">
    <div class="content content-large" >
      <MidiVisualizer />
    </div>
    <div class="content content-small" >
      <inputtext/>
    </div>
  </div>
 <!-- <div>
   <scroll />
  </div>  -->

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

   height:100%;  
 }  
.title {
  margin-top: 1em;
  background-color: var(--background-color);
  color: var(--text--primary);
  text-align: center;
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
.content-large {
  flex:4
}
.content-small {
  flex:1
}

@media (max-width: 800px) {

  #app,.cuerpo {
    padding: 0;
    width: 100%;
  }
  .title {
    font-size: 1 em;
    margin-top: 0;
  }
  .container {
    display: flex;
    flex-direction: column; /* Cambia la dirección de los elementos */
    justify-content: center;
    align-items: center;

  }
  .content {
    width: 100%;
    border: 1px solid var(--border-color);
  }
}
</style>
