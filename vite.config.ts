import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  base: '/EasymidiKaraoke/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@jamescoyle/vue-icon')) {
              return 'vue-icon';
            }
            if (id.includes('@mdi/js')) {
              return 'mdi-js';
            }
            if (id.includes('tone')) {
              return 'tone';
            }
            if (id.includes('lodash')) {
              return 'lodash';
            }
            if (id.includes('midi-json-parser')) {
              return 'midi-json-parser';
            }
            if (id.includes('bootstrap')) {
              return 'bootstrap';
            }
            if (id.includes('pinia')) {
              return 'pinia';
            }
            if (id.includes('vue-router')) {
              return 'vue-router';
            }
            if (id.includes('vue')) {
              return 'vue';
            }
            return 'vendor';
          }
          if (id.includes('/src/components/MidiVisualizer.vue')) {
            return 'midivisualizer';
          }

          if (id.includes('/src/components/InputText.vue')) {
            return 'inputtext';
          }
        }
      }
    }
  }
})
