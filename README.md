# BeatSaver 谱面搜索

独立的 ESA Pages 前端，基于阿里云官方 Vite + Vue 3 + TypeScript 模板。首页使用 BeatSaver 提供的 Logo，界面使用独立排版。现有反代继续作为 API 和资源后端。

| 页面 | 路径 |
| --- | --- |
| 首页 | `/` |
| 搜索 | `/search?q=camellia` |
| 谱面详情 | `/maps/1520` |

搜索使用 BeatSaver 的公开 `/search/text/{page}`，按相关度排序。搜索卡片桌面双列、手机单列，在封面下方显示三段评分条，右侧显示 BSR、时长、BPM 与图标操作。封面按钮试听 MP3，谱面预览按钮打开 ChroViewer。用户可以点击弹窗外侧或关闭按钮退出。

## 本地预览

需要 Node.js 22.12+ 或 24，以及 Git。首次构建会从 GitHub 读取固定版本的 ChroViewer。

```powershell
Copy-Item .env.example .env.local
npm ci
npm run build
npm run preview
```

`npm run dev` 可用于快速开发 Vue 界面。检查谱面预览时使用上面的完整构建，播放器会生成在 `dist/chroviewer`。

## ESA 部署

创建单独的 Pages 项目 `beatsaver-proxy-frontend`，保持现有反代域名的绑定。推荐把前端代码单独放到 GitHub 仓库，再在 ESA Pages 中导入。

- 构建版本选 Node.js 22.12+ 或 24。
- 安装命令 `npm ci`，构建命令 `npm run build`。仓库中的 `esa.jsonc` 已配置。
- 静态资源目录 `./dist`，回退策略 `singlePageApplication`。直接打开或刷新 `/search` 和 `/maps/{key}` 时由 Vue 路由处理。
- 在 Pages **构建环境变量**中配置下表。静态前端会在构建时读取这些变量，修改后需要重新构建。

| 环境变量 | 本项目默认值 |
| --- | --- |
| `VITE_BEATSAVER_API_BASE` | `https://bsaver-proxy-esa.rayarksb.fun/api` |
| `VITE_BEATSAVER_DOWNLOAD_BASE` | `https://bsaver-proxy-esa.rayarksb.fun` |
| `VITE_BEATSAVER_MEDIA_ORIGIN` | 可选。默认使用下载地址的域名，媒体按来源选择 `/cfcdn`、`/cdn` 或 `/r2`。 |

已登录 ESA CLI 时，也可以在完成本地构建后从项目根目录运行 `npx esa-cli deploy`。上线时给新 Pages 绑定独立域名，例如 `beatsaver.rayarksb.fun`。保持 `bsaver-proxy-esa.rayarksb.fun` 指向原反代。

## 后端联调与后续事项

- 现有后端可用的路由包括 `/api/search/text/0`、`/api/maps/id/{key}`、`/cfcdn` 等媒体路由和 `/{hash}.zip`。前端根据上游资源域名生成对应的代理地址，ChroViewer 也从配置的下载代理读取 ZIP。
- 代理当前原样透传 API JSON 中的外链。这个前端已处理目前使用的封面、试听和 ZIP。如以后开放给其他前端，可考虑在后端提供统一的资源 URL，或为其他官方媒体域名单独增加固定路由。
- 普通 GET 可以下载 ZIP，但此前同一个文件的 HEAD 曾返回 404，不同上游的 Range 响应也不完全一致。当前前端不发 HEAD 探测。如果以后要保证断点续传，建议先统一 HEAD、Range 和 `Content-Disposition` 行为。
- ZIP 的 ESA 站点边缘缓存策略仍缺少实际命中证据。如果要确认站点规则是否应用于 Pages 直接返回的响应，建议增加可核对的缓存命中标记，或将下载单独交给 ESA 常规回源。

ChroViewer 来源为 [Umbranoxio/chroviewer](https://github.com/Umbranoxio/chroviewer)，固定提交 `4d4c74a74f0b2027ed8603ab6e7373434c0a2a18`，按 GPL-2.0-only 分发，构建产物包含 `/chroviewer/SOURCE.txt` 和源码包。浏览器入口与下载适配见 `viewer/`。BeatSaver Logo 使用用户指定的官方静态文件。
