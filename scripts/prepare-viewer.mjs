import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, renameSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const commit = '4d4c74a74f0b2027ed8603ab6e7373434c0a2a18'
const remote = 'https://github.com/Umbranoxio/chroviewer.git'
const dir = fileURLToPath(new URL('../viewer/', import.meta.url))
const source = join(dir, '.upstream')
const marker = join(source, '.source-version')

if (existsSync(marker) && readFileSync(marker, 'utf8') === commit) process.exit(0)
if (existsSync(source)) throw new Error('Remove the previous generated viewer/.upstream before updating ChroViewer.')

mkdirSync(dir, { recursive: true })
const checkout = mkdtempSync(join(dir, '.fetch-'))
try {
  const git = (...args) => execFileSync('git', ['-C', checkout, ...args], { stdio: 'inherit' })
  git('init', '--quiet')
  git('fetch', '--quiet', '--depth=1', remote, commit)
  git('checkout', '--quiet', '--detach', 'FETCH_HEAD')
  writeFileSync(join(checkout, '.source-version'), commit)
  renameSync(checkout, source)
} finally {
  if (existsSync(checkout)) rmSync(checkout, { recursive: true, force: true })
}
