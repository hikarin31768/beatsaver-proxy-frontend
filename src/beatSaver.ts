export interface MapDifficulty {
  characteristic: string
  difficulty: string
  njs?: number
  nps?: number
  notes?: number
  bombs?: number
  obstacles?: number
  seconds?: number
  chroma?: boolean
  me?: boolean
  ne?: boolean
  cinema?: boolean
}

export interface MapVersion {
  hash: string
  state: string
  createdAt?: string
  downloadURL?: string
  coverURL?: string
  previewURL?: string
  diffs?: MapDifficulty[]
}

export interface BeatMap {
  id: string
  name: string
  description?: string
  uploader?: { name: string }
  collaborators?: { name: string }[]
  curator?: { name: string }
  curatedAt?: string
  uploaded?: string
  published?: string
  ranked?: boolean
  blRanked?: boolean
  qualified?: boolean
  blQualified?: boolean
  declaredAi?: 'None' | 'SageScore' | 'Uploader' | 'Admin' | boolean
  automapper?: boolean
  tags?: string[]
  metadata?: {
    songName?: string
    songSubName?: string
    songAuthorName?: string
    levelAuthorName?: string
    bpm?: number
    duration?: number
  }
  stats?: { score?: number; upvotes?: number; downvotes?: number }
  versions?: MapVersion[]
}

interface SearchResult {
  docs: BeatMap[]
  info?: { total?: number }
}

const defaultProxy = 'https://bsaver-proxy-esa.rayarksb.fun'

function proxyBase(raw: string) {
  const url = new URL(raw)
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if (
    (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) ||
    url.username || url.password || url.search || url.hash
  ) {
    throw new Error('代理地址必须是 HTTPS 地址，且不能带凭据、查询参数或锚点。')
  }
  return url.href.replace(/\/$/, '')
}

const apiBase = proxyBase(import.meta.env.VITE_BEATSAVER_API_BASE || defaultProxy + '/api')
const downloadBase = proxyBase(import.meta.env.VITE_BEATSAVER_DOWNLOAD_BASE || defaultProxy)
const mediaOrigin = new URL(
  proxyBase(import.meta.env.VITE_BEATSAVER_MEDIA_ORIGIN || new URL(downloadBase).origin),
).origin
const cdnPrefixes = new Map([
  ['cfcdn.beatsaver.com', '/cfcdn'],
  ['cdn.beatsaver.com', '/cdn'],
  ['r2cdn.beatsaver.com', '/r2'],
])

export class ProxyError extends Error {
  readonly status: number

  constructor(status: number) {
    super(status === 429 ? 'BeatSaver 暂时限流，请稍后重试。' : `代理请求失败（HTTP ${status}）。`)
    this.status = status
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(apiBase + path, {
    signal,
    headers: { Accept: 'application/json' },
    credentials: 'omit',
  })
  if (!response.ok) throw new ProxyError(response.status)
  return response.json()
}

export function searchMaps(query: string, page: number, signal?: AbortSignal) {
  const params = new URLSearchParams({ q: query, sortOrder: 'Relevance' })
  return getJson<SearchResult>(`/search/text/${page}?${params}`, signal)
}

export function getMap(key: string, signal?: AbortSignal) {
  if (!/^[\da-f]{1,16}$/i.test(key)) return Promise.reject(new ProxyError(404))
  return getJson<BeatMap>('/maps/id/' + key.toLowerCase(), signal)
}

export function currentVersion(map: BeatMap) {
  return map.versions?.find(version => version.state === 'Published')
}

export function mediaUrl(raw?: string) {
  if (!raw) return ''
  try {
    const source = new URL(raw)
    const prefix = cdnPrefixes.get(source.hostname)
    if (!prefix || source.protocol !== 'https:' || source.port || source.username || source.password) return ''
    return mediaOrigin + prefix + source.pathname + source.search
  } catch {
    return ''
  }
}

export function downloadUrl(version?: MapVersion) {
  if (!version || !/^[\da-f]{40}$/i.test(version.hash)) return ''
  return downloadBase + '/' + version.hash.toLowerCase() + '.zip'
}

export const difficultyOrder = ['Easy', 'Normal', 'Hard', 'Expert', 'ExpertPlus']
export const difficultyNames: Record<string, string> = {
  Easy: 'Easy', Normal: 'Normal', Hard: 'Hard', Expert: 'Expert', ExpertPlus: 'Expert+',
}

export function difficultyClass(name: string) {
  return difficultyOrder.includes(name) ? 'diff-' + name.toLowerCase() : ''
}

export function uniqueDifficulties(version?: MapVersion) {
  const names = new Set(version?.diffs?.map(diff => diff.difficulty))
  return [...difficultyOrder.filter(name => names.delete(name)), ...names]
}

export function mapBadges(map: BeatMap) {
  return [
    map.curatedAt || map.curator ? { text: '精选', style: 'featured' } : null,
    map.ranked ? { text: 'ScoreSaber 排名', style: 'ranked' } : null,
    map.blRanked ? { text: 'BeatLeader 排名', style: 'ranked' } : null,
    map.qualified || map.blQualified ? { text: '候选排名', style: 'qualified' } : null,
    map.automapper || map.declaredAi === true || map.declaredAi === 'Uploader' || map.declaredAi === 'Admin'
      ? { text: 'AI 辅助', style: 'qualified' } : null,
  ].filter(badge => badge !== null)
}

export function mapTitle(map: BeatMap) {
  return map.name || map.metadata?.songName || '未命名谱面'
}

export function mapperName(map: BeatMap) {
  return [map.uploader, ...(map.collaborators ?? [])]
    .map(user => user?.name?.trim())
    .filter(Boolean)
    .join(', ') || '未知谱师'
}

export function approval(map: BeatMap) {
  const { upvotes = 0, downvotes = 0, score } = map.stats || {}
  const total = upvotes + downvotes
  const rating = score ?? (total > 0 ? upvotes / total : 0.5)
  return (rating * 100).toFixed(1) + '%'
}

// BeatSaver leaves part of the bar neutral to show uncertainty when there are few votes.
export function ratingSegments(upvotes: number, downvotes: number) {
  const total = upvotes + downvotes
  if (total === 0) return { up: 0, neutral: 100, down: 0 }

  const uncertainty = 2 ** (-Math.log(total / 2 + 1) / Math.log(3))
  const confidence = (1 - uncertainty) * Math.min(1, (total + 2) / 25)
  return {
    up: 100 * confidence * upvotes / total,
    neutral: 100 * (1 - confidence),
    down: 100 * confidence * downvotes / total,
  }
}

const relativeDate = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'always' })
const relativeUnits = [
  ['year', 365 * 86400], ['month', 30 * 86400], ['day', 86400],
  ['hour', 3600], ['minute', 60], ['second', 1],
] as const

export function relativeDateLabel(value?: string) {
  const time = value ? Date.parse(value) : NaN
  if (!Number.isFinite(time)) return ''

  const difference = (time - Date.now()) / 1000
  for (const [unit, seconds] of relativeUnits) {
    if (Math.abs(difference) >= seconds) {
      return relativeDate.format(Math.trunc(difference / seconds), unit)
    }
  }
  return '刚刚'
}

export function duration(seconds?: number) {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return '—'
  const whole = Math.floor(seconds)
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0')
}

export function dateLabel(value?: string) {
  const date = value ? new Date(value) : null
  return date && Number.isFinite(date.valueOf())
    ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(date)
    : '—'
}
