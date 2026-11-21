<script setup lang="ts">
import { computed } from 'vue'
import { currentVersion, difficultyClass, difficultyNames, mapBadges, uniqueDifficulties, type BeatMap } from '../beatSaver'
const props = defineProps<{ map: BeatMap; showGenres?: boolean }>()
const difficulties = computed(() => uniqueDifficulties(currentVersion(props.map)))
const badges = computed(() => mapBadges(props.map))
</script>

<template>
  <ul v-if="difficulties.length || badges.length || (showGenres && map.tags?.length)" class="tags" aria-label="谱面标签">
    <li v-for="difficulty in difficulties" :key="difficulty" class="tag" :class="difficultyClass(difficulty)">
      {{ difficultyNames[difficulty] || difficulty }}
    </li>
    <li v-for="badge in badges" :key="badge.text" class="tag" :class="'tag-' + badge.style">{{ badge.text }}</li>
    <template v-if="showGenres">
      <li v-for="tag in map.tags" :key="tag" class="tag">{{ tag }}</li>
    </template>
  </ul>
</template>
