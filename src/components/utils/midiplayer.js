import { ref } from 'vue'

export function useMidiPlayer(pasoGrilla, currentTimePosition) {
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const midiData = ref(null)
  const tempo = ref(120)
  let audioContext = null
  let intervalId = null
  let startTime = 0

  // Initialize Web Audio API
  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  // Create oscillator for playing notes
  function createOscillator(frequency, startTime, duration, velocity) {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    gainNode.gain.value = velocity / 127
    gainNode.gain.setValueAtTime(velocity / 127, startTime)
    gainNode.gain.exponentialRampToValueAt(0.0001, startTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  // Convert MIDI note to frequency
  function midiToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12)
  }

  function loadMidi(data) {
    midiData.value = data
    currentTime.value = 0
  }

  function play() {
    if (!midiData.value) return

    initAudio()
    isPlaying.value = true
    startTime = audioContext.currentTime

    // Schedule all notes
    midiData.value.forEach((note) => {
      const frequency = midiToFrequency(note.nota)
      const noteStartTime = startTime + note.x / (tempo.value * pasoGrilla.value)
      const duration = note.width / (tempo.value * pasoGrilla.value)

      createOscillator(frequency, noteStartTime, duration, note.velocity)
    })

    // Start playback animation
    let lastTimestamp = 0
    const animate = (timestamp) => {
      if (!isPlaying.value) return

      if (!lastTimestamp) lastTimestamp = timestamp
      const elapsed = timestamp - lastTimestamp

      currentTime.value += elapsed * (tempo.value / 60000)
      moveRedLine(currentTime.value)

      lastTimestamp = timestamp
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }

  function pause() {
    isPlaying.value = false
    if (audioContext) {
      audioContext.suspend()
    }
  }

  function stop() {
    isPlaying.value = false
    currentTime.value = 0
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
  }

  function setTempo(newTempo) {
    tempo.value = newTempo
  }

  function moveRedLine(time) {
    if (!isPlaying.value) return
    // Update currentTimePosition for stripe
    const pixelsPerSecond = (tempo.value * pasoGrilla.value) / 60
    const position = time * pixelsPerSecond
    currentTimePosition.value = position
  }

  return {
    isPlaying,
    currentTime,
    tempo,
    loadMidi,
    play,
    pause,
    stop,
    setTempo
  }
}
