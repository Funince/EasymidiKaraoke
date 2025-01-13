import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as Tone from 'tone'

export const usePlayerStore = defineStore('player', () => {
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const tempo = ref(120)
  const audioTrack = ref(null)
  const audioError = ref(null)
  const audioLoaded = ref(false)
  const volume = ref(0.5) // Default volume
  let player = null

  async function setAudioTrack(arrayBuffer) {
    try {
      audioLoaded.value = false
      audioError.value = null

      // Create audio buffer from array buffer
      const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer)

      // Create and load player with buffer
      player = new Tone.Player().toDestination()

      player.buffer = audioBuffer
      audioLoaded.value = true
      console.log('Audio loaded successfully')
    } catch (error) {
      console.error('setAudioTrack error:', error)
      audioError.value = error.message
      audioLoaded.value = false
    }
  }

  async function play() {
    try {
      if (!player || !audioLoaded.value) {
        console.warn('No audio loaded')
        isPlaying.value = true
        return
      }

      await Tone.start()
      await Tone.context.resume()
      console.log('Starting playback')
      const seconds = currentTime.value / 1000

      if (player.state === 'started') {
        player.stop()
      }
      console.log('Playing at', seconds)
      player.start(0, seconds)
      console.log(player)
      isPlaying.value = true
    } catch (error) {
      console.error('Play error:', error)
      audioError.value = error.message
    }
  }
  function pause() {
    try {
      if (player) {
        player.stop()
      }
      isPlaying.value = false
    } catch (error) {
      console.error('Pause error:', error)
    }
  }

  function stop() {
    try {
      if (player) {
        player.stop()
      }
      isPlaying.value = false
    } catch (error) {
      console.error('Stop error:', error)
    }
  }
  function updateTime(value) {
    currentTime.value = value
  }
  function setTempo(value) {
    tempo.value = value
  }

  function setVolume(value) {
    volume.value = value
    if (player) {
      player.volume.value = Tone.gainToDb(value)
    }
  }

  return {
    isPlaying,
    currentTime,
    tempo,
    audioTrack,
    audioError,
    audioLoaded,
    volume,
    setAudioTrack,
    play,
    pause,
    stop,
    updateTime,
    setTempo,
    setVolume,
    Tone
  }
})
