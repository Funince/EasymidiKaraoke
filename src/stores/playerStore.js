import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const tempo = ref(120)

  function play() {
    isPlaying.value = true
  }

  function pause() {
    isPlaying.value = false
  }

  function setTempo(value) {
    tempo.value = value
  }
  function updateTime(value) {
    currentTime.value = value
  }

  return {
    isPlaying,
    currentTime,
    tempo,
    play,
    pause,
    setTempo,
    updateTime
  }
})
