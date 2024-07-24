<template>
  <div class="scroll">
    <div style="width: 10000px">
        <h2>no debes ver esto</h2>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
</script>

<style>
.scroll {
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  height: 15px;
}
.scroll::-webkit-scrollbar {
  height: 15px; /* Alto del scrollbar */
}
.scroll::-webkit-scrollbar-track {
  background: var(--color-2); /* Color del track */
}

.scroll::-webkit-scrollbar-thumb {
  background: var(--color-4); /* Color de la "thumb" */
}
</style>
