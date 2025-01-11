<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">EasyKaraoke</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            File
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li>
                                <a class="dropdown-item" href="#" @click.prevent="triggerFileInput">New file</a>
                                <input type="file" ref="fileInput" accept=".mid,.midi" @change="fileSelect"
                                    style="display: none;">
                            </li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a class="dropdown-item" href="#" @click.prevent="exptAss">Export format (.ass)</a></li>
                            <li><a class="dropdown-item" href="#" @click.prevent="exptSrt">Export format (.srt)</a></li>
                        </ul>
                    </li>
                </ul>

                <ul class="navbar-nav ms-auto">
                    <li v-if="!menuVisible">
                        <button class="nav-link" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
                            aria-expanded="false">
                            Channel {{ channel }}
                        </button>
                    </li>
                    <li v-if="menuVisible" class="nav-item dropdown">
                        <button class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            Channel {{ channel }}
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <a class="dropdown-item" href="#" v-for="(item, index) in menuItems" :key="index"
                                @click="selectItem(item)">
                                {{ item }}
                            </a>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
  
const fileInput = ref(null);
const emit = defineEmits(['SelectChannel', 'exptAss', 'exptSrt', 'fileSelect']);

const props = defineProps({
    listChannel: { Array, default: ["0"] },
});
const channel = ref("0");
const menuVisible = computed(() => props.listChannel.length > 1 ? true : false)

const menuItems = computed(() => {
    return props.listChannel;
});

watch(() => props.listChannel, (newList) => {
    if (newList.length > 0) {
        channel.value = newList[0];
    }
}, { immediate: true });

const triggerFileInput = () => {
    fileInput.value.click();
}

function fileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        emit('fileSelect', file);
    }
}

function exptAss() {
    emit('exptAss')
}

function exptSrt() {
    emit('exptSrt')
}

function selectItem(item) {
    channel.value = item;
    emit('SelectChannel', item)
}
</script>

<style scoped></style>
