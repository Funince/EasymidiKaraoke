<template>
  <header>
    <h1>EASYKARAOKE</h1>
  </header>
  <main>
    <div class="container">
    <div class="content content-large">
      <MidiVisualizer />

    </div>
    <div class="content content-small">
      <inputtext />
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
-->
  </main>

</template>

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
header {
  display: flex;
  line-height: 1.5;
  justify-content: center;
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  /* Usamos flexbox en el contenedor principal */
  flex-direction: column;
  justify-content: flex-end;
  /* Distribuye los elementos a lo largo del contenedor */
  /* Alinea los elementos arriba */
}

.content {
  height: 100%;
  padding: 5px;
  /* Espaciado interno */
}
.content-large {
  height: 80%
}
.content-small {
  height: 100vh;
  /* El elemento ocupa todo el espacio restante */
}

@media (min-width: 1024px) {
  body{
    height: 100vh;
  }
  header {
    display: flex;
    justify-content: center;
    padding-right: calc(var(--section-gap) / 2);
    flex-grow: 1;
  }
  main{
    display: flex;
      flex-direction: column;
      flex-grow: 1;
      height: 100%;
  }
  .container {
  width: 100%;
  height: 100%;
  display: flex;
  /* Usamos flexbox en el contenedor principal */
  justify-content: flex-end;
  
  /* Distribuye los elementos a lo largo del contenedor */
  align-items: flex-start;
  flex-direction: row;
  /* Alinea los elementos arriba */
}
.content {
  height: 100%;
  padding: 5px;
  /* Espaciado interno */
  display: flex;
}
  .content-large {
    flex: 3;
    max-width: 70vw;
    /* El elemento ocupa todo el espacio restante */
  }

  .content-small {
    flex: 1;
  }
 

}
</style>
