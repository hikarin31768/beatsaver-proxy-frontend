<script setup lang="ts">
import { computed } from 'vue'
import { approval, currentVersion, downloadUrl, duration, mapperName, mapTitle, ratingSegments, relativeDateLabel, dateLabel, type BeatMap } from '../beatSaver'
import { usePlayback } from '../usePlayback'
import Icon from './Icon.vue'
import MapCover from './MapCover.vue'
import MapTags from './MapTags.vue'

const props = defineProps<{ map: BeatMap }>()
const { copyBsr, openPreview } = usePlayback()
const version = computed(() => currentVersion(props.map))
const zip = computed(() => downloadUrl(version.value))
const publishedAt = computed(() => version.value ? props.map.uploaded : undefined)
const publishedAgo = computed(() => relativeDateLabel(publishedAt.value))
const upvotes = computed(() => props.map.stats?.upvotes ?? 0)
const downvotes = computed(() => props.map.stats?.downvotes ?? 0)
const ratingParts = computed(() => ratingSegments(upvotes.value, downvotes.value))
</script>

<template>
  <article class="map-card">
    <div class="card-media">
      <MapCover :map="map" />
      <div class="card-rating" :title="'BeatSaver 好评率 ' + approval(map)">
        <div class="rating-bar">
          <div class="rating-track" aria-hidden="true">
            <span class="rating-segment rating-segment-up" :style="{ width: ratingParts.up + '%' }"></span>
            <span class="rating-segment" :style="{ width: ratingParts.neutral + '%' }"></span>
            <span class="rating-segment rating-segment-down" :style="{ width: ratingParts.down + '%' }"></span>
          </div>
          <span class="rating-label">{{ approval(map) }}</span>
        </div>
      </div>
    </div>

    <div class="map-card-body">
      <h2><RouterLink :to="{ name: 'map', params: { key: map.id } }">{{ mapTitle(map) }}</RouterLink></h2>
      <p class="map-byline">
        <span class="byline-mappers">{{ mapperName(map) }}</span>
        <template v-if="publishedAgo">
          <span aria-hidden="true"> · </span><time :datetime="publishedAt" :title="dateLabel(publishedAt)">{{ publishedAgo }}</time>
        </template>
      </p>
      <MapTags :map="map" />
    </div>

    <div class="card-sidebar">
      <dl class="card-metrics">
        <div><dt>BSR</dt><dd class="map-code">#{{ map.id }}</dd></div>
        <div><dt>时长</dt><dd>{{ duration(map.metadata?.duration) }}</dd></div>
        <div><dt>BPM</dt><dd>{{ map.metadata?.bpm ?? '—' }}</dd></div>
      </dl>
      <div class="card-actions">
        <button type="button" class="button card-icon" title="复制 BSR" :aria-label="'复制 BSR ' + map.id" @click="copyBsr(map)"><Icon name="copy" /></button>
        <button type="button" class="button card-icon" title="谱面预览" aria-label="谱面预览" :disabled="!zip" @click="openPreview(map)"><Icon name="preview" /></button>
        <a v-if="zip" :href="zip" class="button card-icon" title="下载谱面" aria-label="下载谱面"><Icon name="download" /></a>
      </div>
    </div>
  </article>
</template>
