<template>
    <div>
      <!-- Control deslizante estilizado como un scroll -->
      <input
        type="range"
        id="scrollbar-x"
        class="custom-scrollbar"
        :min="0"
        :max="100"
        v-model="scrollbarXValue"
        @input="handleScrollX"
      />
  
      <!-- Contenedor con contenido desplazable -->
      <div class="scroller" ref="scroller">
        <div class="content">
          <!-- Contenido largo para desplazar -->
          <p v-for="n in 100" :key="n">Contenido de ejemplo {{ n }}</p>
        </div>
      </div>
    </div>
  </template>
  <script>
  export default {
    data() {
      return {
        scrollbarXValue: 0,
        maxScroll: 0
      };
    },
    methods: {
      handleScrollX() {
        // Ajustar el desplazamiento horizontal del contenedor según el valor del control deslizante
        this.$refs.scroller.scrollLeft = this.scrollbarXValue;
      },
      updateSlider() {
        // Actualizar el valor del control deslizante según el desplazamiento horizontal del contenedor
        this.scrollbarXValue = this.$refs.scroller.scrollLeft;
      }
    },
    mounted() {
      // Actualizar el valor máximo del control deslizante según el tamaño del contenido desplazable
      this.maxScroll = this.$refs.scroller.scrollWidth - this.$refs.scroller.clientWidth;
  
      // Escuchar el evento de desplazamiento para actualizar el control deslizante
      this.$refs.scroller.addEventListener('scroll', this.updateSlider);
    },
    beforeDestroy() {
      // Remover el evento de desplazamiento cuando el componente sea destruido
      this.$refs.scroller.removeEventListener('scroll', this.updateSlider);
    }
  };
  </script>
  <style scoped>
  .custom-scrollbar {
    width: 100%;
    margin-bottom: 1rem;
    /* Estilos adicionales para personalizar la apariencia del control deslizante */
    -webkit-appearance: none;
    appearance: none;
    height: 10px;
    background: #ddd;
    outline: none;
    opacity: 0.7;
    transition: opacity 0.2s;
    position: relative;
  }
  
  .custom-scrollbar::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px; /* Este valor se actualizará dinámicamente */
    height: 10px;
    background: #4CAF50;
    cursor: pointer;
    border: none;
  }
  
  .custom-scrollbar::-moz-range-thumb {
    width: 20px; /* Este valor se actualizará dinámicamente */
    height: 10px;
    background: #4CAF50;
    cursor: pointer;
    border: none;
  }
  
  .scroller {
    border: 1px solid #000;
    width: 100%;
    height: 50vh;
    position: relative;
    overflow-x: auto;
    overscroll-behavior: contain;
  }
  
  .content {
    min-height: 75vh;
    padding: 1rem;
    white-space: nowrap; /* Para que el contenido se desplace horizontalmente */
  }
  </style>
  
  