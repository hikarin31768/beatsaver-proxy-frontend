import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

const resolve = path => fileURLToPath(new URL(path, import.meta.url))
const upstreamSrc = resolve('./.upstream/src')
const proxy = 'https://bsaver-proxy-esa.rayarksb.fun'

function replaceRequired(code, before, after, id) {
  if (!code.includes(before)) throw new Error('ChroViewer patch did not match: ' + id)
  return code.replace(before, after)
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve('../'))
  const api = (env.VITE_BEATSAVER_API_BASE || proxy + '/api').replace(/\/$/, '')
  const download = (env.VITE_BEATSAVER_DOWNLOAD_BASE || proxy).replace(/\/$/, '')
  return {
    root: resolve('./'),
    base: '/chroviewer/',
    publicDir: resolve('./.upstream/public'),
    resolve: { alias: { '@': upstreamSrc } },
    define: {
      'import.meta.env.VITE_BEATSAVER_API_URL': JSON.stringify(api),
      'import.meta.env.VITE_ENABLED_SOURCES': JSON.stringify('beatsaver'),
    },
    plugins: [
      {
        name: 'beatsaver-zip-proxy',
        enforce: 'pre',
        transform(code, id) {
          if (id.endsWith('/.upstream/src/styles.css')) {
            return replaceRequired(code,
              "@import 'tailwindcss';",
              "@import 'tailwindcss' source(none);\n@source './';",
              id)
          }
          if (id.endsWith('/use-viewer-remote-source.ts')) {
            return replaceRequired(code,
              "return new URL(value).protocol === 'https:' ? `/api/source?${new URLSearchParams({ url: value }).toString()}` : value;",
              [
                'const prefix = ' + JSON.stringify(download + '/') + ';',
                'if (!value.startsWith(prefix) || !/^[a-f0-9]{40}\\.zip$/i.test(value.slice(prefix.length))) {',
                "  throw new Error('Use a ZIP URL from the configured BeatSaver download proxy.');",
                '}',
                'return value;',
              ].join('\n'), id)
          }
          if (id.endsWith('/sources/beatsaver/provider.ts')) {
            return replaceRequired(code,
              'requestArrayBuffer(version.downloadURL,',
              'requestArrayBuffer(' + JSON.stringify(download + '/') + " + version.hash.toLowerCase() + '.zip',",
              id)
          }
        },
        transformIndexHtml(html) {
          const origins = [...new Set([new URL(api).origin, new URL(download).origin])].join(' ')
          return html.replace('<head>', '<head>\n    <meta http-equiv="Content-Security-Policy" content="connect-src \'self\' blob: ' +
            origins + '; img-src \'self\' blob: data:; media-src \'self\' blob: data:">')
        },
      },
      react(),
      tailwind(),
    ],
    build: {
      outDir: resolve('../dist/chroviewer'),
      emptyOutDir: true,
      chunkSizeWarningLimit: 1600,
    },
  }
})
