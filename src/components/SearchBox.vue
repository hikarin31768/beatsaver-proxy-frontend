<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Icon from './Icon.vue'

const props = defineProps<{ initial?: string; large?: boolean }>()
const router = useRouter()
const field = ref(props.initial ?? '')
watch(() => props.initial, value => { field.value = value ?? '' })

function submit() {
  const keywords = field.value.trim()
  if (keywords) router.push({ name: 'search', query: { q: keywords } })
}
</script>

<template>
  <form role="search" class="search-box" :class="{ 'search-box-large': large }" @submit.prevent="submit">
    <Icon name="search" />
    <input v-model="field" type="search" autocomplete="off" maxlength="250"
      aria-label="搜索谱面" placeholder="输入歌名、谱师或 BSR 编号" required />
    <button class="button primary" type="submit">搜索</button>
  </form>
</template>
