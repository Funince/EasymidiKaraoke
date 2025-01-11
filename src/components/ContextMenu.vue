<template>
    <div v-if="visible" :style="{ top: `${y}px`, left: `${x}px` }" class="context-menu">
        <ul>
            <li @click="handleAction('cut')">Cut Note</li>
            <li @click="handleAction('move')">Move Note</li>
            <li @click="handleAction('draw')">Draw Mode</li>
            <li @click="handleAction('view')">View Mode</li>
        </ul>
    </div>
</template>

<script setup>
import { ref, defineEmits, onUnmounted } from 'vue';

const visible = ref(false);
const x = ref(0);
const y = ref(0);
const emit = defineEmits(['action']);

let removeClickListener = null;

const handleClickOutside = (event) => {
    // Check if click is outside menu
    const menu = document.querySelector('.context-menu');
    if (menu && !menu.contains(event.target)) {
        hideMenu();
    }
};

const showMenu = (event) => {
    x.value = event.clientX;
    y.value = event.clientY;
    visible.value = true;

    // Add click listener when menu opens
    setTimeout(() => {
        window.addEventListener('click', handleClickOutside);
        removeClickListener = () => window.removeEventListener('click', handleClickOutside);
    }, 0);
};

const hideMenu = () => {
    visible.value = false;
    // Remove click listener when menu closes
    if (removeClickListener) {
        removeClickListener();
        removeClickListener = null;
    }
};

const handleAction = (action) => {
    hideMenu();
    emit('action', action);
};

// Clean up on component unmount
onUnmounted(() => {
    if (removeClickListener) {
        removeClickListener();
    }
});

defineExpose({
    showMenu,
    hideMenu
});
</script>
<style scoped>
.context-menu {
    position: absolute;
    background-color: white;
    border: 1px solid #ccc;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.60);
    z-index: 1000;
    color: black;
}

.context-menu ul {
    list-style: none;
    margin: 0;
    padding: 0;
}

.context-menu li {
    padding: 8px 12px;
    cursor: pointer;
}

.context-menu li:hover {
    background-color: #eee;
}
</style>