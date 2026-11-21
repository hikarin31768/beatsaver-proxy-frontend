<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { mapTitle } from './beatSaver'
import { usePlayback } from './usePlayback'
import Icon from './components/Icon.vue'

const route = useRoute()
const dialog = ref<HTMLDialogElement>()
const { message, preview, stopAudio } = usePlayback()
let timer: ReturnType<typeof setTimeout> | undefined

watch(message, value => {
  clearTimeout(timer)
  if (value) timer = setTimeout(() => { message.value = '' }, 4000)
})
watch(preview, item => {
  if (item && !dialog.value?.open) dialog.value?.showModal()
  if (!item && dialog.value?.open) dialog.value.close()
}, { flush: 'post' })
watch(() => route.fullPath, () => {
  preview.value = null
  stopAudio()
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="shell">
    <header v-if="route.name !== 'home'" class="topbar">
      <div class="wrap topbar-inner">
        <RouterLink to="/" class="brand" aria-label="BeatSaver 谱面搜索首页">
          <img src="/beatsaver_logo.svg" alt="BeatSaver" width="130" height="34" />
        </RouterLink>
        <RouterLink v-if="route.name !== 'search'" :to="{ name: 'search' }" class="nav-link">
          <Icon name="search" /> 谱面搜索
        </RouterLink>
      </div>
    </header>

    <main id="main" class="main"><RouterView /></main>

    <footer class="footer">
      <div class="wrap footer-inner">
        <a href="https://beatsaver.com/">数据来自 BeatSaver</a>
      </div>
    </footer>

    <dialog ref="dialog" class="viewer-dialog" aria-labelledby="viewer-title"
      @click.self="preview = null" @close="preview = null">
      <div v-if="preview" class="viewer-panel">
        <header class="viewer-header">
          <div><p>ChroViewer</p><h2 id="viewer-title">{{ mapTitle(preview.map) }}</h2></div>
          <button type="button" class="icon-button" aria-label="关闭谱面预览" autofocus @click="preview = null">
            <Icon name="close" />
          </button>
        </header>
        <iframe :key="preview.url" :src="preview.url" :title="'谱面预览：' + mapTitle(preview.map)"
          allow="autoplay; fullscreen" allowfullscreen></iframe>
      </div>
    </dialog>

    <div class="toast" role="status" aria-live="polite"><span v-if="message">{{ message }}</span></div>
  </div>
</template>
