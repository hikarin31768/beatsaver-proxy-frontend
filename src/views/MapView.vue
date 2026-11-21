<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { approval, currentVersion, dateLabel, difficultyClass, difficultyNames, downloadUrl, duration,
  getMap, mapperName, mapTitle, ProxyError, type BeatMap } from '../beatSaver'
import { usePlayback } from '../usePlayback'
import Icon from '../components/Icon.vue'
import MapCover from '../components/MapCover.vue'
import MapTags from '../components/MapTags.vue'

const route = useRoute()
const map = ref<BeatMap>()
const loading = ref(false)
const error = ref('')
const notFound = ref(false)
const refresh = ref(0)
const version = computed(() => map.value && currentVersion(map.value))
const zip = computed(() => downloadUrl(version.value))
const { copyBsr, openPreview } = usePlayback()

watch([() => String(route.params.key), refresh], async ([key], _, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  map.value = undefined
  error.value = ''
  notFound.value = false
  loading.value = true
  try {
    const result = await getMap(key, controller.signal)
    if (!controller.signal.aborted) map.value = result
  } catch (reason) {
    if (controller.signal.aborted) return
    notFound.value = reason instanceof ProxyError && reason.status === 404
    error.value = notFound.value ? '找不到这个谱面。' :
      (reason instanceof TypeError ? '连不上谱面代理，请稍后重试。' : (reason as Error).message)
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <section class="wrap page detail-page">
    <button v-if="$router.options.history.state.back?.toString().startsWith('/search')" type="button" class="back-link" @click="$router.back()">
      <Icon name="back" /> 返回搜索结果
    </button>
    <RouterLink v-else to="/search" class="back-link"><Icon name="back" /> 谱面搜索</RouterLink>

    <div v-if="loading" class="state" role="status"><span class="spinner"></span><p>正在加载谱面…</p></div>
    <div v-else-if="error" class="state" role="alert">
      <p>{{ error }}</p>
      <RouterLink v-if="notFound" to="/search" class="button primary">返回搜索</RouterLink>
      <button v-else type="button" class="button primary" @click="refresh++">重试</button>
    </div>
    <template v-else-if="map">
      <article class="detail-hero surface">
        <MapCover :map="map" large />
        <div class="detail-heading">
          <div class="card-topline"><span class="map-code">#{{ map.id }}</span><span class="rating"><Icon name="up" /> {{ approval(map) }}</span></div>
          <h1>{{ mapTitle(map) }}</h1>
          <p>{{ [map.metadata?.songName, map.metadata?.songSubName, map.metadata?.songAuthorName].filter(Boolean).join(' · ') }}</p>
          <p>谱师 <strong>{{ mapperName(map) }}</strong></p>
          <MapTags :map="map" show-genres />
          <div class="detail-actions">
            <a v-if="zip" :href="zip" class="button primary"><Icon name="download" /> 下载谱面</a>
            <button type="button" class="button quiet" :disabled="!zip" @click="openPreview(map)"><Icon name="preview" /> 谱面预览</button>
            <button type="button" class="button quiet" @click="copyBsr(map)"><Icon name="copy" /> 复制 BSR</button>
          </div>
        </div>
      </article>

      <div class="detail-grid">
        <section class="surface detail-section">
          <h2>谱面信息</h2>
          <dl class="facts">
            <div><dt>上传者</dt><dd>{{ map.uploader?.name || '—' }}</dd></div>
            <div v-if="map.collaborators?.length"><dt>合作谱师</dt><dd>{{ map.collaborators.map(user => user.name).join('、') }}</dd></div>
            <div><dt>上传日期</dt><dd>{{ dateLabel(map.uploaded || map.published) }}</dd></div>
            <div><dt>歌曲长度</dt><dd>{{ duration(map.metadata?.duration) }}</dd></div>
            <div><dt>BPM</dt><dd>{{ map.metadata?.bpm ?? '—' }}</dd></div>
            <div v-if="map.curator"><dt>精选策展人</dt><dd>{{ map.curator.name }}</dd></div>
          </dl>
          <template v-if="map.description?.trim()">
            <h3>谱面描述</h3><p class="description">{{ map.description }}</p>
          </template>
        </section>
        <section class="surface detail-section">
          <h2>难度信息</h2>
          <p v-if="!version?.diffs?.length" class="muted">暂无难度数据。</p>
          <ul v-else class="difficulty-list">
            <li v-for="(diff, index) in version.diffs" :key="`${diff.characteristic}-${diff.difficulty}-${index}`" class="difficulty-row">
              <div class="difficulty-heading">
                <div><span class="tag" :class="difficultyClass(diff.difficulty)">{{ difficultyNames[diff.difficulty] || diff.difficulty }}</span><span class="mode">{{ diff.characteristic }}</span></div>
                <button type="button" class="button quiet" :disabled="!zip" :aria-label="'预览 ' + diff.characteristic + ' ' + diff.difficulty"
                  @click="openPreview(map, diff)"><Icon name="play" /> 预览</button>
              </div>
              <dl class="difficulty-stats">
                <div><dt>音符</dt><dd>{{ diff.notes ?? '—' }}</dd></div>
                <div><dt>NPS</dt><dd>{{ diff.nps?.toFixed(2) ?? '—' }}</dd></div>
                <div><dt>NJS</dt><dd>{{ diff.njs ?? '—' }}</dd></div>
                <div><dt>炸弹</dt><dd>{{ diff.bombs ?? '—' }}</dd></div>
                <div><dt>障碍</dt><dd>{{ diff.obstacles ?? '—' }}</dd></div>
              </dl>
              <p v-if="diff.chroma || diff.ne || diff.me || diff.cinema" class="mod-list">
                {{ [diff.chroma && 'Chroma', diff.ne && 'Noodle Extensions', diff.me && 'Mapping Extensions', diff.cinema && 'Cinema'].filter(Boolean).join(' · ') }}
              </p>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </section>
</template>
