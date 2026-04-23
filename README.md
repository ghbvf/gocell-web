# gocell-web

`gocell-web` 是从旧单体前端目录拆出的 Vue 3 + Vite 前端仓库。

## 开发说明

- 前端源码现在位于 `src/`。
- 本地开发时，DevTools 模块会读取 sibling backend repo `../gocell` 中的元数据文件。
- 因此在运行 `npm run dev` 前，需要确保本机存在 `/Users/shengming/Documents/code/gocell`，或者至少存在与之等价的 `../gocell` 目录布局。

## 当前状态

- UI 源码已经迁移到当前仓库。
- API 代理仍默认指向本地后端端口 `8081`、`8082`、`8083`。
- DevTools 的最终解耦尚未完成；要完全独立部署，需要后端提供 Metadata API。
