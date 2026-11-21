import { execFileSync } from 'node:child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { unzipSync, zipSync } from 'fflate'

const project = fileURLToPath(new URL('../', import.meta.url))
const upstream = join(project, 'viewer', '.upstream')
const output = join(project, 'dist', 'chroviewer')
const commit = readFileSync(join(upstream, '.source-version'), 'utf8')
const remote = 'https://github.com/Umbranoxio/chroviewer'
const sourceArchive = execFileSync('git', [
  '-C', upstream, 'archive', '--format=zip', '--prefix=upstream/', commit,
  'src', 'scripts', 'patches', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml',
  'tsconfig.json', 'vite.config.ts', 'LICENSE', 'ATTRIBUTIONS.md',
], { maxBuffer: 25 * 1024 * 1024 })

const source = unzipSync(sourceArchive)
for (const file of ['viewer/index.html', 'viewer/entry.tsx', 'viewer/vite.config.mjs',
  'scripts/prepare-viewer.mjs', 'scripts/package-viewer-source.mjs', 'package.json', 'package-lock.json']) {
  source[file] = readFileSync(join(project, file))
}
const notice =
  'ChroViewer is distributed under GPL-2.0-only. See LICENSE and ATTRIBUTIONS.md.\n' +
  'Original source: ' + remote + '/tree/' + commit + '\n' +
  'Corresponding program source and integration files: chroviewer-source.zip\n' +
  'Original public assets: ' + remote + '/tree/' + commit + '/public\n'
source['SOURCE.txt'] = Buffer.from(notice)
writeFileSync(join(output, 'chroviewer-source.zip'), zipSync(source))
writeFileSync(join(output, 'SOURCE.txt'), notice)
for (const file of ['LICENSE', 'ATTRIBUTIONS.md']) copyFileSync(join(upstream, file), join(output, file))
