import { Midi } from '@tonejs/midi'

export function exportRectsToMidi(rects, tempo, usporquarter, pasoGrilla) {
  const midi = new Midi()
  const track = midi.addTrack()

  // Set the tempo
  midi.header.setTempo(tempo)

  rects.forEach(rect => {
    const startTime = (rect.x * usporquarter) / pasoGrilla/ 1000000// Convert to seconds
    const duration = (rect.width * usporquarter) / pasoGrilla / 1000000 // Convert to seconds
    track.addNote({
      midi: rect.nota,
      time: startTime,
      duration: duration,
      velocity: rect.velocity / 127
    })
  })

  return midi.toArray()
}
