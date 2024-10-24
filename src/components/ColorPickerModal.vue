<template>
    <dialog ref="dialog" class="centered-dialog">
        <form method="dialog" @submit.prevent="accept">
            <h3>Selecciona un color</h3>
            <div class="color-input">
                <input type="color" v-model="color" :disabled="!isColorEnabled" />
                <input type="text" v-model="hexColor" class="color-hex-input" :disabled="!isColorEnabled" />
            </div>
            <div class="slider-input">
                <label>{{ isColorEnabled ? 'Karaoke On' : 'Karaoke Off' }}</label>
                <input type="checkbox" v-model="isColorEnabled" />
            </div>
            <div class="modal-actions">
                <button type="button" @click="cancel">Cancelar</button>
                <button type="submit">Aceptar</button>
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
const isColorEnabled = ref(true);

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
    emit('accept', { color: color.value, isColorEnabled: isColorEnabled.value });

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

.color-input {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
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

.slider-input label {
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
</style>
