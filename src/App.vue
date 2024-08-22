<template>
  <header>
    
  </header>
  <main>
    <div class="con">
      
    <div class="content content-large">
      
      <MidiVisualizer :sharedData="sharedData" :seChannel="seChannel" />
      
    </div>
    <div class="content content-small">
      <InputText @dataUpdated="updateData"/>
    </div>
  </div>
  </main>
</template>

<script setup>
import MidiVisualizer from '@/components/MidiVisualizer.vue'
import InputText from '@/components/InputText.vue'
import { ref } from 'vue';

const sharedData = ref([]);
const seChannel = ref("0");
const updateData = (newData) => {
  sharedData.value = newData;
}

</script>
<style>




.con {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin: 0px;

}

.content {
  height: 100%;

  /* Espaciado interno */
}
.content-large {
  height: 100%;
  max-height: 90vh;
}
.content-small {
  height: 100vh;
  /* El elemento ocupa todo el espacio restante */
}

@media (min-width: 1024px) {
  body{
    height: 100vh;
  }

  main{
    display: flex;
      flex-direction: column;
      flex-grow: 1;
      height: 100%;
      width: 100%;
  }
  .con {
  width: 100%;
  height: 100%;
  display: flex;

  justify-content: flex-end;

 align-items: flex-start;
  flex-direction: row;
  margin: 0px;

}
.content {
  height: 100%;

  /* Espaciado interno */
  display: flex;
}
  .content-large {
    flex: 3;
    max-width: 70vw;
    min-height: 70vh;
    height: 100%;
  }

  .content-small {
    flex: 1;
    height: 100%;
  }
}
</style>
