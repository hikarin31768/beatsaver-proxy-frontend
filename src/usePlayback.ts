import { ref, shallowRef } from 'vue'
import { currentVersion, downloadUrl, mediaUrl, type BeatMap, type MapDifficulty } from './beatSaver'

const audio = typeof Audio === 'undefined' ? null : new Audio()
const playingKey = ref('')
const message = ref('')
const preview = shallowRef<{ map: BeatMap; url: string } | null>(null)

audio?.addEventListener('ended', () => { playingKey.value = '' })
audio?.addEventListener('error', () => {
  if (playingKey.value) message.value = '试听加载失败，请稍后再试。'
  playingKey.value = ''
})

function stopAudio() {
  audio?.pause()
  playingKey.value = ''
}

async function toggleAudio(map: BeatMap) {
  if (!audio) return
  const url = mediaUrl(currentVersion(map)?.previewURL)
  if (!url) return
  if (playingKey.value === map.id) {
    stopAudio()
    return
  }
  message.value = ''
  audio.src = url
  playingKey.value = map.id
  try {
    await audio.play()
  } catch {
    if (playingKey.value === map.id) {
      playingKey.value = ''
      message.value = '试听加载失败，请稍后再试。'
    }
  }
}

const ranks: Record<string, number> = { Easy: 1, Normal: 3, Hard: 5, Expert: 7, ExpertPlus: 9 }

function openPreview(map: BeatMap, difficulty?: MapDifficulty) {
  const zip = downloadUrl(currentVersion(map))
  if (!zip) return
  stopAudio()
  const query = new URLSearchParams({ map: zip, autoplay: 'true' })
  if (difficulty && ranks[difficulty.difficulty]) {
    query.set('characteristic', difficulty.characteristic)
    query.set('difficulty', String(ranks[difficulty.difficulty]))
  }
  preview.value = { map, url: '/chroviewer/index.html?' + query }
}

async function copyBsr(map: BeatMap) {
  const command = '!bsr ' + map.id
  try {
    await navigator.clipboard.writeText(command)
    message.value = '已复制 ' + command
  } catch {
    message.value = '请手动复制 ' + command
  }
}

export function usePlayback() {
  return { playingKey, message, preview, toggleAudio, openPreview, stopAudio, copyBsr }
}
