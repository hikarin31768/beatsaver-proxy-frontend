<script setup lang="ts">
defineProps<{ name: 'search' | 'play' | 'pause' | 'copy' | 'preview' | 'download' | 'close' | 'music' | 'up' | 'back' | 'next' }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icon">
    <g v-if="name === 'search'"><circle cx="10.7" cy="10.7" r="6.2" /><path d="m15.4 15.4 4 4" /></g>
    <path v-else-if="name === 'play'" d="m9 5 11 7-11 7z" fill="currentColor" stroke="none" />
    <path v-else-if="name === 'pause'" d="M9 5v14m6-14v14" stroke-width="3" />
    <g v-else-if="name === 'copy'"><rect x="9" y="8" width="11" height="12" rx="2" /><path d="M15 5V4H6a2 2 0 0 0-2 2v9h2" /></g>
    <g v-else-if="name === 'preview'"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></g>
    <path v-else-if="name === 'download'" d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" />
    <path v-else-if="name === 'close'" d="m6 6 12 12M18 6 6 18" />
    <path v-else-if="name === 'music'" d="M9 17V6l11-2v11M9 6v3l11-2M9 17c0 1.1-1.2 2-2.7 2s-2.8-.9-2.8-2 1.3-2 2.8-2S9 15.9 9 17Zm11-2c0 1.1-1.2 2-2.7 2s-2.8-.9-2.8-2 1.3-2 2.8-2 2.7.9 2.7 2Z" />
    <path v-else-if="name === 'up'" d="m5 13 4 4L19 7" />
    <path v-else-if="name === 'back'" d="m14 6-6 6 6 6" />
    <path v-else-if="name === 'next'" d="m10 6 6 6-6 6" />
  </svg>
</template>
