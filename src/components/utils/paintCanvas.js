import { ref, onMounted, onUnmounted } from 'vue'
export function paintCanvas(
  height_note = 16,
  NOTAS_TOTAL = 128,
  whitecolor = '#f0f0f0',
  blackcolor = '#e0e0e0'
) {
  const rCanvas = ref(null)
  const gridcanvas = ref(null)
  const ctx = ref(null)
  const ctg = ref(null)
  const rects = ref([])
  const isDragging = ref(false)
  const dragIndex = ref(null)
  const startX = ref(0)
  const startY = ref(0)
  const scale = ref({ x: 1, y: 1 }) // Factores de escala para x e y
  const list_text = ref([]) // Lista de textos para las notas
  const pasoGrilla = ref(150)
  const offsetX = ref(0)
  const grilla = ref([])

  height_note = height_note * scale.value.y
  // Dibujar la cuadrícula
  function getNoteName(noteNumber) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const octave = Math.floor(noteNumber / 12) - 1
    const noteName = noteNames[Math.floor(noteNumber % 12)]
    return noteName ? `${noteName}${octave}` : ''
  }

  function exportData() {
      const data = []
      
      for (let index = 0; index < rects.value.length; index++) {
        if (list_text.value.length > index) {
          const rect = rects.value[index]
          const silaba = list_text.value[index]
          const startTime = rect.x
          const endTime = rect.x + rect.width
          data.push([silaba, startTime, endTime])
        } else {
          
          break // Termina cuando no existan más sílabas
        }
      }
     return data
  }
  function drawGrid() {
    const blackKeys = new Set([1, 3, 6, 8, 10])

    // Crear rectángulos iniciales

    ctx.value.clearRect(0, 0, rCanvas.value.width, rCanvas.value.height)

    // Aplicar la escala

    for (let i = 0; i < NOTAS_TOTAL; i++) {
      const noteInOctave = i % 12
      const color = blackKeys.has(noteInOctave) ? blackcolor : whitecolor
      ctx.value.fillStyle = color
      ctx.value.fillRect(
        0,
        rCanvas.value.height - height_note - i * height_note,
        rCanvas.value.width,
        height_note
      )
      // Dibujar líneas de la cuadrícula
      ctx.value.strokeStyle = '#d0d0d0'
      ctx.value.lineWidth = 1
      ctx.value.strokeRect(
        0,
        rCanvas.value.height - height_note - i * height_note,
        rCanvas.value.width,
        height_note
      )
    }
    paintGrid()
  }

  function paintGrid() {
    gridcanvas.value.width = rCanvas.value.width
    gridcanvas.value.height = 40
    ctg.value.clearRect(0, 0, rCanvas.value.width, rCanvas.value.height)
    ctg.value.strokeStyle = '#d0d0d0'
    const leftLimit = offsetX.value
    const rightLimit = offsetX.value + rCanvas.value.width + 10

    grilla.value.forEach((gr, index) => {
      const punto = gr.x / scale.value.x
      if (punto <= rightLimit && punto >= leftLimit) {
        const x = punto - offsetX.value
        let tamaño = (height_note / scale.value.x) * 10
        //tamaño1 es el tamaño de la letra
        let tamaño1 = tamaño > 20 ? 20 : tamaño

        if (index % 4 == 0) {
          ctx.value.lineWidth = 2
          ctx.value.beginPath()
          ctx.value.moveTo(x, 0)
          ctx.value.lineTo(x, rCanvas.value.height)
          ctx.value.stroke()

          ctg.value.lineWidth = 2
          ctg.value.beginPath()
          ctg.value.moveTo(x, 40)
          ctg.value.lineTo(x, 20)
          ctg.value.stroke()

          ctg.value.fillStyle = whitecolor
          ctg.value.font = `${tamaño1}px Arial`
          ctg.value.fillText(gr.text, x - 1, 20 - 1)
        } else {
          ctx.value.lineWidth = 1
          ctx.value.beginPath()
          ctx.value.moveTo(x, 0)
          ctx.value.lineTo(x, rCanvas.value.height)
          ctx.value.stroke()

          ctg.value.lineWidth = 1
          ctg.value.beginPath()
          ctg.value.moveTo(x, 40)
          ctg.value.lineTo(x, 30)
          ctg.value.stroke()
          if (tamaño > 35) {
            ctg.value.fillStyle = whitecolor
            ctg.value.font = `${20}px Arial`
            ctg.value.fillText(gr.text, x - 30, 25)
          }
        }
      }
    })
  }
  // Dibujar el rectángulo
  function drawRectangles() {
    rects.value.forEach((rect, index) => {
      const leftLimit = offsetX.value
      const rightLimit = offsetX.value + rCanvas.value.width
      const puntoinicial = rect.x / scale.value.x
      const puntofinal = (rect.x + rect.width) / scale.value.x

      if (puntoinicial < rightLimit && puntofinal > leftLimit) {
        ctx.value.fillStyle = 'rgba(0, 128, 255, 0.5)'
        const y = rCanvas.value.height - rect.nota * height_note
        const x = rect.x / scale.value.x - offsetX.value
        ctx.value.fillRect(x, y, rect.width / scale.value.x, -height_note)
        ctx.value.strokeStyle = '#eef'
        ctx.value.lineWidth = 1
        ctx.value.strokeRect(x, y, rect.width / scale.value.x, -height_note)
        const textNota = getNoteName(rect.nota)
        ctx.value.fillStyle = 'black'
        ctx.value.font = `${height_note}px Arial`
        ctx.value.fillText(textNota, x, y)
        if (list_text.value.length > index ) {
          ctx.value.fillStyle = 'black'
          ctx.value.font = `${height_note}px Arial`
          ctx.value.fillText(list_text.value[index], x, y + height_note)
        }
      }
    })
  }

  // Ajustar a la cuadrícula
  function snapToGrid(value) {
    return Math.round(value)
  }

  // Manejar los eventos del mouse
  function pickClick(e) {
    const mousePos = getMousePos(e)
    rects.value.forEach((rect, index) => {
      const y = rCanvas.value.height - rect.nota * height_note
      if (
        mousePos.x >= rect.x &&
        mousePos.x <= rect.x + rect.width &&
        mousePos.y >= y - height_note &&
        mousePos.y <= y
      ) {
        isDragging.value = true
        dragIndex.value = index
        startX.value = mousePos.x - rect.x
        startY.value = mousePos.y - y
      }
    })
  }

  function pickDrag(e) {
    if (isDragging.value && dragIndex.value !== null) {
      const mousePos = getMousePos(e)
      rects.value[dragIndex.value].x = mousePos.x - startX.value
      rects.value[dragIndex.value].nota =
        (rCanvas.value.height - mousePos.y + startY.value) / height_note

      drawGrid()
      drawRectangles()
    }
  }

  function pickRelease() {
    if (isDragging.value && dragIndex.value !== null) {
      rects.value[dragIndex.value].x = snapToGrid(
        rects.value[dragIndex.value].x,
        rects.value[dragIndex.value].width
      )

      rects.value[dragIndex.value].nota = snapToGrid(rects.value[dragIndex.value].nota)
      drawGrid()
      drawRectangles()
      isDragging.value = false
      dragIndex.value = null
    }
  }

  // Obtener la posición del mouse
  function getMousePos(evt) {
    const rect = rCanvas.value.getBoundingClientRect()
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    }
  }
  onMounted(() => {
    rCanvas.value.width = 100
    gridcanvas.value.width = 100
    rCanvas.value.height = NOTAS_TOTAL * height_note
    ctx.value = rCanvas.value.getContext('2d')
    ctg.value = gridcanvas.value.getContext('2d')
    drawGrid()
  })

  return {
    gridcanvas,
    offsetX,
    pasoGrilla,
    list_text,
    rCanvas,
    grilla,
    rects,
    scale,
    exportData,
    drawGrid,
    drawRectangles,
    pickClick,
    pickDrag,
    pickRelease
  }
}
