<script setup lang="ts">
defineProps<{ large?: boolean }>()
</script>

<template>
  <span class="brand-mark" :class="{ 'brand-mark-large': large }">
    <img src="/beatsaver_logo.svg" alt="BeatSaver 非官方镜像" width="167" height="26" />
    <span class="brand-mirror" aria-hidden="true">MIRROR</span>
  </span>
</template>
