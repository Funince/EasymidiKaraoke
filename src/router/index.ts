import MidiVisualizer from '@/components/MidiVisualizer.vue'
import path from 'path'
import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
   {path: '/',
    name: 'MidiVisualizer',
    component: MidiVisualizer,
   },
   
  ]
})

export default router
