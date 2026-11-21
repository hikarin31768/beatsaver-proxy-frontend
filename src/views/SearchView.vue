<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchMaps, type BeatMap } from '../beatSaver'
import SearchBox from '../components/SearchBox.vue'
import MapCard from '../components/MapCard.vue'
import Icon from '../components/Icon.vue'

const route = useRoute()
const keywords = computed(() => typeof route.query.q === 'string' ? route.query.q.trim() : '')
const page = computed(() => {
  const raw = Number(route.query.page)
  return Number.isSafeInteger(raw) && raw > 1 && raw <= 1000 ? raw : 1
})
const docs = ref<BeatMap[]>([])
const loading = ref(false)
const error = ref('')
const total = ref<number>()
const refresh = ref(0)
const nextPage = computed(() => page.value < 1000 && (total.value === undefined ? docs.value.length >= 20 : total.value > page.value * 20))

function pageLink(number: number) {
  return { name: 'search', query: { q: keywords.value, ...(number > 1 ? { page: String(number) } : {}) } }
}

watch([keywords, page, refresh], async ([q, number], _, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  docs.value = []
  total.value = undefined
  error.value = ''
  loading.value = Boolean(q)
  if (!q) return
  try {
    const result = await searchMaps(q, number - 1, controller.signal)
    if (controller.signal.aborted) return
    docs.value = result.docs || []
    total.value = result.info?.total
  } catch (reason) {
    if (!controller.signal.aborted) error.value = reason instanceof TypeError ? '连不上搜索代理，请稍后重试。' : (reason as Error).message
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <section class="wrap page">
    <header class="search-heading">
      <div><h1>谱面搜索</h1><p v-if="keywords">搜索「{{ keywords }}」</p></div>
      <SearchBox :initial="keywords" />
    </header>

    <div v-if="loading" class="state" role="status"><span class="spinner"></span><p>正在搜索谱面…</p></div>
    <div v-else-if="error" class="state" role="alert"><p>{{ error }}</p><button type="button" class="button primary" @click="refresh++">重试</button></div>
    <div v-else-if="!keywords" class="state"><Icon name="search" /><p>输入关键词开始搜索。</p></div>
    <template v-else>
      <div v-if="!docs.length" class="state"><Icon name="music" /><p>没有找到谱面，试试其他关键词。</p></div>
      <div v-else class="results-grid"><MapCard v-for="map in docs" :key="map.id" :map="map" /></div>
      <nav v-if="page > 1 || nextPage" class="pagination" aria-label="搜索结果分页">
        <RouterLink v-if="page > 1" :to="pageLink(page - 1)" class="button quiet"><Icon name="back" /> 上一页</RouterLink>
        <span>第 {{ page }} 页</span>
        <RouterLink v-if="nextPage" :to="pageLink(page + 1)" class="button quiet">下一页 <Icon name="next" /></RouterLink>
      </nav>
    </template>
  </section>
</template>
