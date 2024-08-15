<template>
  <div id="elComponente" :ref="containerRef" :class="['ScrollBar', className] ">
    <div
      class="button-backward"
      :style="buttonStyle"
      @mousedown.prevent="handleMouseDown($event, -SCROLL_BASE_AMOUNT)"
      @mouseup="stopCounting"
      @mouseleave.prevent="stopCounting"
    >
      <svg-icon type="mdi" :path="ArrowUP" class="triangle"></svg-icon>
    </div>
    <div
      class="page-backward"
      :style="pageBackwardStyle"
      @mousedown.prevent="handleMouseDown($event, -4 * SCROLL_BASE_AMOUNT)"
      @mouseup="stopCounting"
      @mouseleave.prevent="stopCounting"
    />
    <div
      v-if="!disabled"
      ref="thumb"
      class="thumb"
      :style="thumbStyle"
      @mousedown.prevent="onMouseDownThumb($event)"
    />
    <div
      class="page-forward"
      :style="pageForwardStyle"
      @mousedown.prevent="handleMouseDown($event, 4 * SCROLL_BASE_AMOUNT)"
      @mouseup="stopCounting"
      @mouseleave.prevent="stopCounting"
    />
    <div
      class="button-forward"
      :style="buttonStyle"
      @mousedown.prevent="handleMouseDown($event, SCROLL_BASE_AMOUNT)"
      @mouseup="stopCounting"
      @mouseleave.prevent="stopCounting"
    >
      <svg-icon type="mdi" :path="ArrowUP" class="triangle"></svg-icon>
    </div>
  </div>
</template>
<script setup>
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiArrowUpDropCircleOutline } from '@mdi/js'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
const thumb = ref(null)
const scrollOffset = ref(0)
defineExpose({ scrollOffset })
const BAR_WIDTH = 17
const BUTTON_SIZE = 15
const MIN_THUMB_LENGTH = BAR_WIDTH
const LONG_PRESS_INTERVAL = 50
const LONG_PRESS_SPEED = 0.5
const SCROLL_BASE_AMOUNT = ref(20)
const ArrowUP = ref(mdiArrowUpDropCircleOutline)

const hola = () => {
  console.log('hola')
}
const props = defineProps({
  isVertical: { Boolean, default: false },

  contentLength: { Number, default: 1000 }
})

function normalize(v) {
  return Math.max(0, Math.min(1, v))
}
function getPoint(e) {
  return {
    x: e.pageX,
    y: e.pageY
  }
}
const ancho = ref(100)
const containerRef = ref(null)
const buttonLength = BUTTON_SIZE
const maxOffset = computed(() => props.contentLength - ancho.value)
const maxLength = computed(() => ancho.value - BUTTON_SIZE * 2)
const valueRatio = computed(() => normalize(ancho.value / props.contentLength))
const thumbLength = computed(() => Math.max(MIN_THUMB_LENGTH, maxLength.value * valueRatio.value))
const disabled = computed(() => maxOffset.value <= 0)

const className = computed(() => (props.isVertical ? 'vertical' : 'horizontal'))
const lengthProp = computed(() => (props.isVertical ? 'height' : 'width'))

const pageForwardLength = computed(() => {
  if (disabled.value) return 0
  return Math.floor(
    (maxLength.value - thumbLength.value) * normalize(scrollOffset.value / maxOffset.value)
  )
})

const pageBackwardLength = computed(() => {
  if (disabled.value) return maxLength.value
  return Math.floor(maxLength.value - thumbLength.value - pageForwardLength.value)
})

const buttonStyle = computed(() => ({
  [lengthProp.value]: `${buttonLength}px`
}))

const thumbStyle = computed(() => ({
  [lengthProp.value]: `${thumbLength.value}px`
}))

const pageBackwardStyle = computed(() => ({
  [lengthProp.value]: `${pageForwardLength.value}px`
}))
const pageForwardStyle = computed(() => ({
  [lengthProp.value]: `${pageBackwardLength.value}px`
}))

function onscroll(scroll) {
  scrollOffset.value = Math.max(0, Math.min(maxOffset.value, scroll))
}
watch(scrollOffset,
  () => {
    onscroll(scrollOffset.value)
  }
)

let moveIntervalId = null

const handleMouseDown = (e, delta) => {
  if (disabled.value) {
    return
  }
  let scroll = scrollOffset.value
  console.log('scroll', scroll)
  if (!moveIntervalId) {
    moveIntervalId = setInterval(() => {
      scroll += delta * LONG_PRESS_SPEED
      onscroll(scroll)
    }, LONG_PRESS_INTERVAL)
  }
}

let startPosThumb = null
let drag = false
const onMouseDownThumb = (e) => {
  startPosThumb = getMousePos(e)

  drag = true
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopOnMouseUp)
}

function onMouseMove(e) {
  if (drag) {
    const currentPos = getMousePos(e)

    const delta = props.isVertical ? currentPos.y - startPosThumb.y : currentPos.x - startPosThumb.x

    const ratio = delta / maxLength.value

    const scroll = scrollOffset.value + ratio * maxOffset.value

    onscroll(scroll)
  }
}

function getMousePos(evt) {
  const rect = thumb.value.getBoundingClientRect()

  const x = evt.clientX - rect.left
  const y = evt.clientY - rect.top

  return {
    x: x,
    y: y
  }
}

function stopOnMouseUp() {
  startPosThumb = null
  drag = false
  document.removeEventListener('mousemove', onMouseMove)
}
const stopCounting = () => {
  clearInterval(moveIntervalId)
  moveIntervalId = null
}

function size(t) {
  if (props.isVertical) {
    ancho.value = t.clientHeight
  } else {
    ancho.value = t.clientWidth
  }
}

function handleKeyDown(event) {
  const tecla = event.key
  if (tecla === 'ArrowUp' || tecla === 'ArrowDown') {
    return;
  }
  event.preventDefault();
  let scroll1 = scrollOffset.value
  switch (tecla) {
    case 'ArrowLeft':      
      scroll1 -= 2*SCROLL_BASE_AMOUNT.value * LONG_PRESS_SPEED
      onscroll(scroll1)
      break

    case 'ArrowRight':
      scroll1 += 2*SCROLL_BASE_AMOUNT.value * LONG_PRESS_SPEED
      onscroll(scroll1)
      break
    default:
      break
  }
}
let resizeObserver
onMounted(() => {
  const t = document.getElementById('elComponente')
  size(t)
  resizeObserver = new ResizeObserver(() => {
    size(t)
  })
  resizeObserver.observe(t)
  const d = document.getElementById('visualization');
  if (d) {
    d.addEventListener('keydown', handleKeyDown);
  }
})
</script>
<style scoped>
.vertical {
  border: 1px solid;
  display: flex;
  width: 17px;
  height: 100%;
  top: 0;
  right: 0;
  flex-direction: column;
}

.horizontal {
  border: 1px solid;
  display: flex;
  width: 100%;
  height: 17px;
  bottom: 0;
  left: 0;
  flex-direction: row;
}
.thumb {
  background-color: rgb(94, 94, 99);
  cursor: pointer;
  border: 1px solid;
  opacity: 0.2;
}
.thumb:hover {
  opacity: 0.7;
}
.thumb:active {
  opacity: 1;
}

.triangle {
  pointer-events: none;
  text-align: center;
  width: 15px;
  height: 15px;
}

.vertical .button-backward,
.vertical .button-forward {
  flex-direction: column;
  justify-content: center;
  display: flex;
}
.horizontal .button-backward,
.horizontal .button-forward {
  flex-direction: row;
  align-items: center;
  display: flex;
}

.vertical .button-forward .triangle {
  transform: rotate(180deg);
}
.horizontal .button-forward .triangle {
  transform: rotate(90deg);
}
.horizontal .button-backward .triangle {
  transform: rotate(-90deg);
}

.button-backward:hover,
.button-forward:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.button-backward:active,
.button-forward:active {
  background-color: rgba(255, 255, 255, 0.4);
}
</style>
