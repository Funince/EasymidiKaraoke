<template>
    <dialog ref="dialog" class="centered-dialog">
        <form method="dialog" @submit.prevent="accept">
            <h3>Export Options</h3>

            <div class="form-group">
                <div class="input-row">
                    <label class="input-label">Delay (seconds):</label>
                    <input type="number" v-model="delay" step="0.1" class="delay-input">
                </div>
            </div>

            <template v-if="format === 'srt'">
                <!-- Base Color Section -->
                <div class="form-group">
                    <div class="input-row">
                        <label class="input-label">Base Color:</label>
                        <input type="color" v-model="baseColor" class="color-input" />
                        <input type="text" v-model="baseHexColor" class="color-hex-input" />
                    </div>
                </div>

                <div class="slider-input">
                    <label>{{ isColorEnabled ? 'Karaoke On' : 'Karaoke Off' }}</label>
                    <input type="checkbox" v-model="isColorEnabled" />
                </div>
                <div class="form-group" v-if="isColorEnabled">
                    <div class="form-group">
                        <div class="input-row">
                            <label class="input-label">Highlight Color:</label>
                            <input type="color" v-model="color" :disabled="!isColorEnabled" class="color-input" />
                            <input type="text" v-model="hexColor" class="color-hex-input" :disabled="!isColorEnabled" />
                        </div>
                    </div>
                    <div class="input-row">
                        <label class="input-label">Anticipation Time (seconds):</label>
                        <input type="number" v-model="anticipationTime" step="0.1" class="anticipation-input">
                    </div>
                    <div class="input-row">
                        <label class="input-label">Visible sentences:</label>
                        <input type="number" v-model="maxVisibleSentences" min="1" max="5" class="sentences-input">
                    </div>
                </div>
            </template>

            <div class="modal-actions">
                <button type="button" @click="cancel">Cancel</button>
                <button type="submit">Accept</button>
            </div>
        </form>
    </dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    isVisible: {
        type: Boolean,
        required: true
    },
    format: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['accept', 'cancel']);

watch(() => props.isVisible, (newVal) => {
    if (newVal) {
        dialog.value.showModal();
    } else {
        dialog.value.close();
    }
});

const dialog = ref(null);
const color = ref('#000000');
const hexColor = ref('#000000');
const baseColor = ref('#ffffff');
const baseHexColor = ref('#ffffff');
const isColorEnabled = ref(true);
const delay = ref(0);
const anticipationTime = ref(1); // Default anticipation time
const maxVisibleSentences = ref(3); // Default value, min: 1

watch(baseColor, (newColor) => {
    baseHexColor.value = newColor;
});

watch(baseHexColor, (newHex) => {
    if (newHex.match(/^#[0-9A-Fa-f]{6}$/)) {
        baseColor.value = newHex;
    }
});

watch(color, (newColor) => {
    if (isColorEnabled.value) {
        hexColor.value = newColor;
    }
});

watch(hexColor, (newHex) => {
    if (isColorEnabled.value) {
        color.value = newHex;
    }
});

function accept() {
    const options = { 
        delay: parseFloat(delay.value),
        baseColor: baseColor.value === '#ffffff' ? 'white' : baseColor.value
    };
    if (props.format === 'srt') {
        options.color = color.value;
        options.isColorEnabled = isColorEnabled.value;
        options.anticipation_time = parseFloat(anticipationTime.value);
        options.maxVisibleSentences = parseInt(maxVisibleSentences.value);
    }
    emit('accept', options);
    dialog.value.close();
}

function cancel() {
    emit('cancel');
    dialog.value.close();
}

</script>

<style scoped>
.centered-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: none;
    padding: 20px;
    background: rgba(5, 5, 5, 0.8);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    max-width: 400px;
    width: 100%;
}

h3 {
    margin-top: 0;
    font-size: 1.5em;
    text-align: center;
    color: whitesmoke;
}

.form-group {
    margin: 20px 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.input-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 10px;
    margin-bottom: 10px;
}

.input-label {
    width: 150px; /* Same width as color input */
}

.color-input {
    width: 110px;
    margin-right:40px ;
}

.color-hex-input {
    margin-left: 10px;
    font-family: monospace;
    width: 80px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.slider-input {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
}

label {
    margin-right: 10px;
    color: whitesmoke;
}

.modal-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
}

button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
}

button[type="button"] {
    background-color: #f44336;
    color: white;
}

button[type="submit"] {
    background-color: #4CAF50;
    color: white;
}

.delay-input {
    width: 80px; /* Same width as color input */
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
}

.anticipation-input {
    width: 80px; /* Same width as color input */
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
}

.sentences-input {
    width: 80px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
}
</style>
