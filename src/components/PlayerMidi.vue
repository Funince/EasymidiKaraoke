<template>
    <div class="playback-controls">
        <button @click="togglePlay">
            <SvgIcon type="mdi" :path="isPlaying ? pause : play" />
        </button>

        <input type="file" accept="audio/*" @change="handleAudioUpload" ref="audioInput" class="audio-input-hidden" />
        <div class="audio-controls">
            <button class="custom-file-button" @click="$refs.audioInput.click()" :disabled="isPlaying">
                Select Audio Track
            </button>
            <span v-if="selectedFileName" class="file-name">{{ selectedFileName }}</span>
        </div>

        <audio ref="audioElement" />
        <span>{{ formattedTime }}</span>
        <span>BPM: {{ store.tempo }}</span>
        <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="updateVolume" />
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { mdiPause, mdiPlay } from '@mdi/js'
import { usePlayerStore } from '@/stores/playerStore'
import SvgIcon from '@jamescoyle/vue-icon'

const store = usePlayerStore()
const play = mdiPlay
const pause = mdiPause

const isPlaying = computed(() => store.isPlaying)

const audioElement = ref(null)
const audioInput = ref(null)

const selectedFileName = ref('')
const volume = ref(0.5) // Default volume


async function handleAudioUpload(event) {
    const file = event.target.files[0]
    if (file) {
        selectedFileName.value = file.name

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        await store.setAudioTrack(arrayBuffer)
    }
}
function handleKeydown(e) {
    e.preventDefault()
    if (e.code === 'Space') {
        
        togglePlay()
    }
}

function togglePlay() {
    if (store.isPlaying) {
        store.pause()
    } else {
        store.play()
    }
}

function updateVolume() {
    store.setVolume(volume.value)
}

const formattedTime = computed(() => {
    const minutes = Math.floor(store.currentTime / 60000)
    const seconds = Math.floor((store.currentTime % 60000) / 1000)
    const milliseconds = Math.floor((store.currentTime % 1000))
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
})

onMounted(() => {
    const principal = document.querySelector('.cuerpo')
    
    principal.addEventListener('keydown', handleKeydown)
    updateVolume() // Set initial volume
})

onUnmounted(() => {
    principal.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
.playback-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
}

.audio-input-hidden {
    display: none;
}

.custom-file-button {
    background: #4a5568;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.custom-file-button:hover {
    background: #2d3748;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-file-button:active {
    transform: translateY(0);
}

.custom-file-button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.audio-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.file-name {
    font-size: 14px;
    color: #4a5568;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.playback-controls button {
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 4px;
    background: rgb(75, 134, 211);
    color: white;
    cursor: pointer;
}

.playback-controls button:disabled {
    background: #ccc;
    cursor: not-allowed;
}
</style>
