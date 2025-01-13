import { ref, onMounted, onUnmounted, watch } from 'vue'
import { convertirTicksATiempo } from './timeUtils'
import { usePlayerStore } from '@/stores/playerStore'
import { splitNote, findClickedNote } from './noteOperations'

export function paintCanvas(
  height_note = 16,
  NOTAS_TOTAL = 128,
  whitecolor = '#f0f0f0',
  blackcolor = '#e0e0e0',
  totalWidth,
  usporquarter
) {
  let elapsedTime = 0
  const store = usePlayerStore()
  const Tone = store.Tone

  // Initialize Tone.js sampler
  const sampler = new Tone.Sampler({
    urls: {
      C4: 'C4.mp3',
      'D#4': 'Ds4.mp3',
      'F#4': 'Fs4.mp3',
      A4: 'A4.mp3'
    },
    release: 1,
    baseUrl: 'https://tonejs.github.io/audio/salamander/'
  }).toDestination()

  const rCanvas = ref(null)
  const gridcanvas = ref(null)
  const stripeCanvas = ref(null) // New canvas for red stripe
  const ctx = ref(null)
  const ctg = ref(null)
  const stripeCtx = ref(null) // New context for red stripe
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
  const isCutMode = ref(false)
  const isDrawMode = ref(false)
  const isMoveMode = ref(false)
  const isViewMode = ref(true) // Default mode
  const SCROLL_ZONE = 50 // pixels from edge to trigger scroll
  const SCROLL_SPEED = 15 * 0.5 // base scroll speed
  const currentTimePosition = ref(0) // Track current time position
  const mouseX = ref(0) // Track mouse X position
  const mouseY = ref(0)
  const persistentRedLineX = ref(0) // Stores the x-coordinate of the persistent red line
  const selectedNoteIndex = ref(null)
  const isDeleteMode = ref(false)

  height_note = height_note * scale.value.y
  height_note = height_note * scale.value.y
  // Add state for undo history
  const undoHistory = ref([])
  const MAX_HISTORY = 50

  // Save state before modification
  function saveState() {
    console.log('Save state')
    undoHistory.value.push(JSON.stringify(rects.value))
    if (undoHistory.value.length > MAX_HISTORY) {
      undoHistory.value.shift()
    }
  }

  // Undo last action
  function undo() {
    if (undoHistory.value.length > 0) {
      const previousState = undoHistory.value.pop()
      rects.value = JSON.parse(previousState)
      drawGrid()
      drawRectangles()
    }
  }
  /* 
  function handleKeydown(e) {
    e.stopPropagation()
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault()
      undo()
    }
  }
   // Initialize Web Audio API
  let audioContext = null
  let masterGain = null
  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    if (!masterGain) {
      masterGain = audioContext.createGain()
      masterGain.gain.value = 0.6
      masterGain.connect(audioContext.destination)
    }
  }

  // Create oscillator for playing notes
  function createOscillator(frequency, startTime, duration, velocity) {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Set oscillator type and frequency
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    // Set gain based on velocity
    const volume = (velocity / 127) * masterGain.gain.value // Adjust by master volume
    gainNode.gain.value = volume
    gainNode.gain.setValueAtTime(volume, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(masterGain)

    // Start and stop oscillator
    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  // Convert MIDI note to frequency
  function midiToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12)
  }
*/
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

  // Draw the red stripe on the separate canvas
  function drawRedStripe() {
    stripeCtx.value.clearRect(0, 0, stripeCanvas.value.width, stripeCanvas.value.height)
    drawPersistentRedLine()
    const x = currentTimePosition.value / scale.value.x - offsetX.value
    stripeCtx.value.strokeStyle = 'red'
    stripeCtx.value.lineWidth = 2
    stripeCtx.value.beginPath()
    stripeCtx.value.moveTo(x - stripeCtx.value.lineWidth, 0)
    stripeCtx.value.lineTo(x - stripeCtx.value.lineWidth, stripeCanvas.value.height)
    stripeCtx.value.stroke()

    const tiempo = convertirTicksATiempo(
      currentTimePosition.value,
      usporquarter.value,
      pasoGrilla.value
    )
    stripeCtx.value.fillStyle = 'black'
    stripeCtx.value.font = '20px Arial'
    stripeCtx.value.fillText(
      tiempo,
      stripeCanvas.value.width - 100,
      stripeCanvas.value.height - height_note
    ) // Draw time at mouse position
  }

  // Function to draw the persistent red line
  const drawPersistentRedLine = () => {
    if (!stripeCanvas.value || persistentRedLineX.value === null) return
    const context = stripeCanvas.value.getContext('2d')
    const x = persistentRedLineX.value / scale.value.x - offsetX.value
    context.beginPath()
    context.moveTo(x - 2, 0)
    context.lineTo(x - 2, stripeCanvas.value.height)
    context.strokeStyle = 'rgba(255, 0, 0, 0.7)' // Red with 70% opacity
    context.lineWidth = 2
    context.stroke()
  }

  // Function to handle clicks on the gridcanvas
  const handleGridCanvasClick = (event) => {
    console.log('Click on grid canvas')
    if (!gridcanvas.value || !stripeCanvas.value) return

    // Store the x-coordinate as the new persistent red line position
    persistentRedLineX.value = currentTimePosition.value

    console.log('x:', persistentRedLineX.value)
    elapsedTime = ((persistentRedLineX.value * 60) / (store.tempo * pasoGrilla.value)) * 1000
    store.updateTime(elapsedTime)
    // Clear and redraw the persistent red line
    const context = stripeCanvas.value.getContext('2d')
    context.clearRect(0, 0, stripeCanvas.value.width, stripeCanvas.value.height)
    drawPersistentRedLine()
  }

  function drawGrid() {
    const blackKeys = new Set([1, 3, 6, 8, 10])

    ctx.value.clearRect(0, 0, rCanvas.value.width, rCanvas.value.height)

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
  // Add function to update indices
  function updateRectIndices() {
    // Sort rects by x position
    rects.value.sort((a, b) => a.x - b.x)
    // Update indices
    rects.value.forEach((rect, index) => {
      rect.index = index
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
        if (list_text.value.length > index) {
          ctx.value.fillStyle = 'black'
          ctx.value.font = `${height_note}px Arial`
          ctx.value.fillText(list_text.value[index], x, y + height_note)
        }
      }
    })
    drawRedStripe()
  }

  // Add these functions and modifications
  function handleMouseDown(e) {
    if (e.button !== 0) return

    e.preventDefault()
    if (isMoveMode.value) {
      pickClick(e)
    } else if (isDrawMode.value) {
      startDrawing(e)
    } else if (isCutMode.value) {
      handleNoteCut(e)
    } else if (isDeleteMode.value) {
      handleNoteDelete(e)
    } else if (isViewMode.value) {
      handleGridCanvasClick(e)
    }
  }

  function handleMouseMove(e) {
    const mousePos = getMousePos(e, true)

    mouseX.value = mousePos.x
    mouseY.value = mousePos.y
    currentTimePosition.value = (mousePos.x + offsetX.value) * scale.value.x
    drawRedStripe() // Only redraw the red stripe
    if (isMoveMode.value && isDragging.value) {
      pickDrag(e)
    } else if (isDrawMode.value && isDragging.value) {
      continueDrawing(e)
    }
  }

  function handleMouseUp(e) {
    if (isMoveMode.value) {
      pickRelease()
    } else if (isDrawMode.value) {
      finishDrawing(e)
    }
  }
  function startDrawing(e) {
    saveState()
    const mousePos = getMousePos(e)
    isDragging.value = true
    startX.value = mousePos.x
    startY.value = mousePos.y

    // Create new note
    const newNote = {
      id: `new_${rects.value.length}`,
      x: (startX.value + offsetX.value) * scale.value.x,
      nota: Math.floor((rCanvas.value.height - startY.value) / height_note),
      width: 0,
      channel: 0,
      velocity: 64
    }

    rects.value.push(newNote)
    dragIndex.value = rects.value.length - 1
  }

  function continueDrawing(e) {
    if (!isDragging.value) return

    const mousePos = getMousePos(e)
    const note = rects.value[dragIndex.value]
    const width = (mousePos.x + offsetX.value) * scale.value.x - note.x

    if (width > 0) {
      note.width = width
      drawGrid()
      drawRectangles()
    }
  }

  function finishDrawing(e) {
    if (!isDragging.value) return

    const mousePos = getMousePos(e)
    const note = rects.value[dragIndex.value]
    const width = (mousePos.x + offsetX.value) * scale.value.x - note.x

    if (width > 0) {
      note.width = width
      updateRectIndices() // Update indices after drawing
    } else {
      rects.value.splice(dragIndex.value, 1)
    }

    isDragging.value = false
    dragIndex.value = null
    drawGrid()
    drawRectangles()
  }
  // Update existing event handlers
  const pickClick = (e) => {
    if (!isMoveMode.value) return

    const mousePos = getMousePos(e)
    isDragging.value = true
    startX.value = mousePos.x
    startY.value = mousePos.y

    dragIndex.value = findClickedNote(
      mousePos.x,
      mousePos.y,
      rects.value,
      height_note,
      scale.value,
      offsetX.value
    )
    if (dragIndex.value !== -1) {
      saveState()
    }
  }

  const pickDrag = (e) => {
    handleNoteMove(e)
  }

  // Add cleanup on note release
  const pickRelease = () => {
    if (dragIndex.value !== null) {
      updateRectIndices() // Update indices after moving
      isDragging.value = false
      dragIndex.value = null
      cancelAnimationFrame(scrollAnimationId)
      scrollAnimationId = null
      currentScrollDirection = null
      drawGrid()
      drawRectangles()
    }
  }

  function setMode(mode) {
    isCutMode.value = mode === 'cut'
    isDrawMode.value = mode === 'draw'
    isMoveMode.value = mode === 'move'
    isViewMode.value = mode === 'view'
    isDeleteMode.value = mode === 'delete'

    // Update cursor style
    if (rCanvas.value) {
      rCanvas.value.style.cursor =
        mode === 'cut'
          ? 'crosshair'
          : mode === 'draw'
            ? 'cell'
            : mode === 'move'
              ? 'move'
              : mode === 'delete'
                ? 'not-allowed'
                : 'default'
    }
  }
  let lastMouseX = 0
  let scrollAnimationId = null
  let currentScrollDirection = null

  function handleNoteMove(event) {
    if (!isMoveMode.value || !isDragging.value) return

    const mousePos = getMousePos(event)
    const deltaX = (mousePos.x - startX.value) * scale.value.x

    // Detect direction change
    const currentDirection =
      mousePos.x < lastMouseX ? 'left' : mousePos.x > lastMouseX ? 'right' : currentScrollDirection

    // Cancel existing scroll if direction changed
    if (currentScrollDirection && currentDirection !== currentScrollDirection) {
      cancelAnimationFrame(scrollAnimationId)
      currentScrollDirection = null
    }

    if (dragIndex.value !== null) {
      const canvasWidth = rCanvas.value.width
      const canvasHeight = rCanvas.value.height
      const mouseY = canvasHeight - mousePos.y
      const newNota = Math.floor(mouseY / height_note)
      const note = rects.value[dragIndex.value]

      // Apply bounds checking
      note.x = Math.max(
        offsetX.value * scale.value.x,
        Math.min(note.x + deltaX, (offsetX.value + canvasWidth) * scale.value.x - note.width)
      )
      note.nota = Math.max(0, Math.min(NOTAS_TOTAL - 1, newNota))

      // Handle edge scrolling
      if (mousePos.x < SCROLL_ZONE && currentDirection !== 'right') {
        currentScrollDirection = 'left'
        const scroll = () => {
          const scrollAmount = SCROLL_SPEED
          offsetX.value = Math.max(0, offsetX.value - scrollAmount)
          note.x = Math.max(offsetX.value * scale.value.x, note.x - scrollAmount * scale.value.x)
          drawGrid()
          drawRectangles()
          scrollAnimationId = requestAnimationFrame(scroll)
        }
        if (!scrollAnimationId) scroll()
      } else if (mousePos.x > canvasWidth - SCROLL_ZONE && currentDirection !== 'left') {
        currentScrollDirection = 'right'
        const scroll = () => {
          const scrollAmount = SCROLL_SPEED
          offsetX.value = Math.min(
            totalWidth.value / scale.value.x - canvasWidth,
            offsetX.value + scrollAmount
          )
          note.x = Math.min(
            (offsetX.value + canvasWidth) * scale.value.x - note.width,
            note.x + scrollAmount * scale.value.x
          )
          drawGrid()
          drawRectangles()
          scrollAnimationId = requestAnimationFrame(scroll)
        }
        if (!scrollAnimationId) scroll()
      } else {
        cancelAnimationFrame(scrollAnimationId)
        scrollAnimationId = null
        currentScrollDirection = null
      }

      startX.value = mousePos.x
      startY.value = mousePos.y
      lastMouseX = mousePos.x

      drawGrid()
      drawRectangles()
    }
  }

  // Obtener la posición del mouse
  function getMousePos(evt, absolute = false) {
    if (absolute) {
      return {
        x: evt.clientX,
        y: evt.clientY
      }
    } else {
      const rect = rCanvas.value.getBoundingClientRect()
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      }
    }
  }
  function findClickedNote(mouseX, mouseY) {
    return rects.value.findIndex((rect) => {
      const scaledX = rect.x / scale.value.x - offsetX.value
      const scaledWidth = rect.width / scale.value.x
      const y = rCanvas.value.height - rect.nota * height_note

      return (
        mouseX >= scaledX &&
        mouseX <= scaledX + scaledWidth &&
        mouseY >= y - height_note &&
        mouseY <= y
      )
    })
  }

  // Manejar el corte de notas
  function enableCutMode() {
    isCutMode.value = true
    rCanvas.value.style.cursor = 'crosshair'
  }

  function disableCutMode() {
    isCutMode.value = false
    rCanvas.value.style.cursor = 'default'
  }

  function handleNoteCut(event) {
    if (!isCutMode.value) return
    const rect = rCanvas.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const noteIndex = findClickedNote(
      mouseX,
      mouseY,
      rects.value,
      height_note,
      scale.value,
      offsetX.value
    )

    if (noteIndex !== -1) {
      const [firstNote, secondNote] = splitNote(
        rects.value[noteIndex],
        mouseX,
        scale.value,
        offsetX.value
      )
      saveState()
      rects.value.splice(noteIndex, 1, firstNote, secondNote)
      drawGrid()
      drawRectangles()
    }
  }

  function handleNoteDelete(event) {
    const mousePos = getMousePos(event)
    const noteIndex = findClickedNote(
      mousePos.x,
      mousePos.y,
      rects.value,
      height_note,
      scale.value,
      offsetX.value
    )

    if (noteIndex !== -1) {
      saveState()
      rects.value.splice(noteIndex, 1)
      drawGrid()
      drawRectangles()
    }
  }

  onMounted(() => {
    rCanvas.value.width = 100
    gridcanvas.value.width = 100
    rCanvas.value.height = NOTAS_TOTAL * height_note
    ctx.value = rCanvas.value.getContext('2d')
    ctg.value = gridcanvas.value.getContext('2d')
    // Initialize stripe canvas
    stripeCanvas.value.style.position = 'absolute'
    stripeCanvas.value.style.pointerEvents = 'none'
    stripeCanvas.value.width = rCanvas.value.width
    stripeCanvas.value.height = (rCanvas.value.clientHeight + gridcanvas.value.clientHeight)
    
    stripeCanvas.value.style.left = rCanvas.value.offsetLeft + 'px'
    stripeCtx.value = stripeCanvas.value.getContext('2d')
    rCanvas.value.parentNode.appendChild(stripeCanvas.value)

    rCanvas.value.addEventListener('mousedown', handleMouseDown)
    gridcanvas.value.addEventListener('click', handleGridCanvasClick)
    rCanvas.value.addEventListener('mousemove', handleMouseMove)
    gridcanvas.value.addEventListener('mousemove', handleMouseMove)
    rCanvas.value.addEventListener('mouseup', handleMouseUp)
    rCanvas.value.addEventListener('mouseleave', handleMouseUp)
    drawGrid()
  })

  onUnmounted(() => {
    rCanvas.value.removeEventListener('mousedown', handleMouseDown)
    gridcanvas.value.removeEventListener('click', handleGridCanvasClick)
    rCanvas.value.removeEventListener('mousemove', handleMouseMove)
    gridcanvas.value.removeEventListener('mousemove', handleMouseMove)
    rCanvas.value.removeEventListener('mouseup', handleMouseUp)
    rCanvas.value.removeEventListener('mouseleave', handleMouseUp)

    if (stripeCanvas.value && stripeCanvas.value.parentNode) {
      stripeCanvas.value.parentNode.removeChild(stripeCanvas.value)
    }
  })

  let animationId = null

  let isPaused = false
  let isAnimating = false

  watch(
    () => store.isPlaying,
    (isPlaying) => {
      if (isPlaying) {
        startAnimation()
      } else {
        pauseAnimation()
      }
    }
  )
  function startAnimation() {
    let lastFrameTime = null
    if (isAnimating) return // Prevent multiple animations

    if (isPaused) {
      isPaused = false
    }

    let playingNotes = new Map() // Track currently playing notes

    function animate(currentTime) {
      if (!isPaused) {
        if (lastFrameTime === null) {
          lastFrameTime = currentTime
        }

        // Calculate delta time between frames
        const deltaTime = currentTime - lastFrameTime
        elapsedTime += deltaTime
        lastFrameTime = currentTime

        store.updateTime(elapsedTime)
        // Update red stripe position
        const currentPosition = ((elapsedTime / 1000) * (store.tempo * pasoGrilla.value)) / 60
        currentTimePosition.value = currentPosition
        persistentRedLineX.value = currentPosition

        // Check for notes to play
        rects.value.forEach((rect) => {
          const rectX = rect.x
          const rectEnd = rect.x + rect.width
          // Note starts playing
          if (
            currentPosition >= rectX &&
            currentPosition <= rectEnd &&
            !playingNotes.has(rect.id)
          ) {
            const noteName = Tone.Frequency(rect.nota, 'midi').toNote()
            const duration = (rect.width * usporquarter.value) / pasoGrilla.value / 1000000
            sampler.triggerAttackRelease(
              noteName,
              duration,
              Tone.now(),
              rect.velocity ? rect.velocity / 127 : 0.5
            )

            playingNotes.set(rect.id, rectEnd)
          }

          // Remove finished notes
          if (currentPosition > rectEnd) {
            playingNotes.delete(rect.id)
          }
        })

        drawRedStripe()
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
  }

  function pauseAnimation() {
    isPaused = true
    isAnimating = false
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
      startTime = null
      elapsedTime = 0
      isPaused = false
      isAnimating = false
      currentTimePosition.value = 0
      drawRedStripe()
    }
  }
  return {
    gridcanvas,
    stripeCanvas,
    offsetX,
    pasoGrilla,
    list_text,
    rCanvas,
    grilla,
    rects,
    scale,
    isCutMode,
    isDrawMode,
    isMoveMode,
    isViewMode,
    isDeleteMode,
    currentTimePosition,
    mouseX,
    mouseY,
    undoHistory,
    setMode,
    exportData,
    drawGrid,
    drawRectangles,
    pickClick,
    pickDrag,
    pickRelease,
    enableCutMode,
    disableCutMode,
    undo,
    selectedNoteIndex,
    handleNoteDelete
  }
}
