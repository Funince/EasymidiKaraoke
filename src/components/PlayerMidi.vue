<template>
    <ul class="navbar-nav mx-auto">
        <li class="nav-item">
            <button class="btn btn-primary" @click="play">
                <svg-icon type="mdi" :path="play"></svg-icon>

            </button>
        </li>
        <li class="nav-item">
            <button class="btn btn-secondary" @click="pause">
                <svg-icon type="mdi" :path="pause"></svg-icon>
            </button>
        </li>
        <li class="nav-item">
            <input type="number" class="form-control" v-model="tempo" placeholder="Tempo" step="0.01" max="999.99"
                style="width: 80px;">
        </li>
    </ul>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiPause, mdiPlay } from '@mdi/js';
const play = ref(mdiPlay);
const pause = ref(mdiPause);    
const tempo = ref(120);
const emit = defineEmits(['play', 'pause', 'changeTempo']);
watch(() => tempo, (newTempo) => {
    emit('changeTempo', newTempo);
});
</script>

<style>
.playback-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
}

.playback-controls button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #4CAF50;
    color: white;
    cursor: pointer;
}

.playback-controls button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.playback-controls input[type="range"] {
    width: 200px;
}
</style>