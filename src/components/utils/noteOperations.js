export function splitNote(note, splitPoint, scale, offsetX) {
  const adjustedSplitPoint = (splitPoint + offsetX) * scale.x

  const firstNote = {
    ...note,
    width: adjustedSplitPoint - note.x
  }

  const secondNote = {
    ...note,
    x: adjustedSplitPoint,
    width: note.width - (adjustedSplitPoint - note.x),
    id: `${note.id}_2`
  }

  return [firstNote, secondNote]
}

export function findClickedNote(mouseX, mouseY, notes, height_note, scale, offsetX) {
  return notes.findIndex((note) => {
    const scaledX = note.x / scale.x - offsetX
    const scaledWidth = note.width / scale.x
    const noteY = note.nota * height_note

    return (
      mouseX >= scaledX &&
      mouseX <= scaledX + scaledWidth &&
      mouseY >= noteY &&
      mouseY <= noteY + height_note
    )
  })
}
