<template>
    <div id="conteiner">
        <h2>Ingrese la letra</h2>
        <textarea ref="input_letra" id="input_letra"
            placeholder="Ingrese la letra de la canción separada por silaba con -" autofocus="true" spellcheck="false"
            dir="ltr" rows="1"></textarea>
        <button @click="lyricsProcess">
            Procesar letra
        </button>
    <p>
        {{ texto_dividido }}
    </p>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import {textToMidi} from '@/components/utils/text_Midi.js'
let texto_dividido = ref(''); 
const lyricsProcess = () => {
 texto_dividido.value=ref(textToMidi(input_letra.value))
}
</script>

<style>
    #conteiner {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        height: 100%;
        width: 100%;
    }
    
    #input_letra {
        width: 100%;
        height: 90%;
        padding: 8px;
        resize: none; 
        box-sizing: border-box;
        overflow: auto;
        text-overflow:hidden;
        overflow-wrap: break-word;
        outline-style: none;
        font-size: 16px;
        color: var(--text--primary);
        background-color: transparent;
        font-family: "Inter", "Arial", "Helvetica", "sans-serif";
    }
</style>