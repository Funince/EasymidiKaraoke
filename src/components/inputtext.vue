<template>
  <div id="conteiner">
    <h2 class="no-select">Lyrics</h2>
    <textarea
      ref="input_letra"
      id="input_letra"
      placeholder="Enter the lyrics of the song separated by syllable with - and join note $"
      autofocus="true"
      spellcheck="false"
      dir="ltr"
      rows="1"
    ></textarea>
    <button class="btn btn-secondary w-100 m-1" @click="lyricsProcess">Process lyrics</button>
    <!-- <p v-if="texto_dividido">
        {{ texto_dividido }}
    </p> -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { textToMidi } from '@/components/utils/text_Midi.js'
let texto_dividido = ref('')
const emit = defineEmits(['dataUpdated'])
const lyricsProcess = () => {
  const separateText = textToMidi(input_letra.value)
  texto_dividido.value = ref(textToMidi(input_letra.value))
  emit('dataUpdated', separateText)
}
</script>

<style>
#conteiner {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: 100%;
  width: 100%;
}

#input_letra {
  width: 100%;
  height: 90%;
  padding: 8px;
  resize: none;
  box-sizing: border-box;
  overflow: auto;
  text-overflow: hidden;
  overflow-wrap: break-word;
  outline-style: none;
  font-size: 16px;
  color: var(--text--primary);
  background-color: transparent;
  font-family: 'Inter', 'Arial', 'Helvetica', 'sans-serif';
}

.no-select {
  user-select: none;
  /* Para la mayoría de los navegadores modernos */
  -webkit-user-select: none;
  /* Para navegadores basados en WebKit */
  -moz-user-select: none;
  /* Para Firefox */
  -ms-user-select: none;
  /* Para Internet Explorer/Edge */
}
</style>
