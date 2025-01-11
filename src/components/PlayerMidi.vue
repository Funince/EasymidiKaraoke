<template>
    <div class="playback-controls">
        <button @click="togglePlay">
            <SvgIcon type="mdi" :path="isPlaying ? pause : play" />
        </button>
        <span>{{ store.tempo }} BPM</span>
        <span>Time: {{ formattedTime }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPause, mdiPlay } from '@mdi/js'
import { usePlayerStore } from '@/stores/playerStore'

const store = usePlayerStore()
const play = mdiPlay
const pause = mdiPause

const isPlaying = computed(() => store.isPlaying)




function togglePlay() {
    if (store.isPlaying) {
        store.pause()
    } else {
        store.play()
    }
}

const formattedTime = computed(() => {
    const minutes = Math.floor(store.currentTime / 60000)
    const seconds = Math.floor((store.currentTime % 60000) / 1000)
    const milliseconds = Math.floor((store.currentTime % 1000))
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
})
</script>

<style>
.playback-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: transparent;
    border-bottom: 1px solid #ddd;
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
