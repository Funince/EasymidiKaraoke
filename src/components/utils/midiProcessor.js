export function processMidi(midi, height_note, tempTracks) {
  const pasoGrilla = midi.division
  console.log('midi', midi)
  // Altura total basada en el rango de notas MIDI
  const totalHeight = 128 * height_note.value
  // Escala para las notas MIDI
  let maxTime = 0
  let usporquarter = 500000
  midi.tracks.forEach((track, trackIndex) => {
    let currentTime = 0
    const noteEvents = []
    
    // Construir una lista de eventos de notas con duraciones calculadas
    track.forEach((event, index) => {
      currentTime += event.delta
      if (event.timeSignature) {
        console.log('timeSignature', event.timeSignature)
      } else if (event.setTempo) {
        usporquarter = event.setTempo.microsecondsPerQuarter
        
      } else if (event.noteOn) {
        if (!tempTracks[event.channel]) {
          tempTracks[event.channel] = []
        }
        noteEvents.push({
          noteNumber: event.noteOn.noteNumber,
          startTime: currentTime,
          channel: event.channel,
          velocity: event.noteOn.velocity
        })
      }
      if (event.noteOff) {
        const noteOnEvent = noteEvents.find(
          (e) =>
            e.noteNumber === event.noteOff.noteNumber && e.channel === event.channel && !e.endTime
        )
        if (noteOnEvent) {
          noteOnEvent.endTime = currentTime
          noteOnEvent.duration = currentTime - noteOnEvent.startTime
        }
        if (currentTime > maxTime) {
          maxTime = currentTime
        }
      }
    })

    // Dibujar las notas MIDI
    noteEvents.filter((note) => note.endTime).forEach((note) => addItem(note, tempTracks))
  })

  return { pasoGrilla, totalHeight, maxTime, usporquarter }
}

function addItem(note, tempTracks) {
  const index = tempTracks[note.channel].length > 0 ? tempTracks[note.channel].length : 0

  tempTracks[note.channel].push({
    id: `${index}`,
    x: note.startTime,
    nota: note.noteNumber,
    width: note.duration,
    channel: note.channel,
    velocity: note.velocity
  })
}
