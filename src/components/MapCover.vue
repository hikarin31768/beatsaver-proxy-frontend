<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { currentVersion, mapTitle, mediaUrl, type BeatMap } from '../beatSaver'
import { usePlayback } from '../usePlayback'
import Icon from './Icon.vue'

const props = defineProps<{ map: BeatMap; large?: boolean }>()
const { playingKey, toggleAudio } = usePlayback()
const failed = ref(false)
const version = computed(() => currentVersion(props.map))
const image = computed(() => mediaUrl(version.value?.coverURL))
const playable = computed(() => Boolean(mediaUrl(version.value?.previewURL)))
const playing = computed(() => playingKey.value === props.map.id)
watch(image, () => { failed.value = false })
</script>

<template>
  <component :is="playable ? 'button' : 'div'" class="cover" :class="{ 'cover-large': large, 'is-playing': playing }"
    :type="playable ? 'button' : undefined"
    :aria-label="playable ? (playing ? '暂停试听 ' : '试听 ') + mapTitle(map) : undefined"
    :aria-pressed="playable ? playing : undefined" @click="playable && toggleAudio(map)">
    <img v-if="image && !failed" :src="image" :alt="playable ? '' : mapTitle(map) + ' 的封面'"
      :loading="large ? 'eager' : 'lazy'" decoding="async" @error="failed = true" />
    <span v-else class="cover-placeholder"><Icon name="music" /></span>
    <span v-if="playable" class="cover-play"><Icon :name="playing ? 'pause' : 'play'" /></span>
  </component>
</template>
