import MidiVisualizer from '@/components/MidiVisualizer.vue'
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
