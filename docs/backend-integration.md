# 后端集成与解耦说明

本项目已经恢复了前端源码，但目前仍然依赖 sibling backend repo `../gocell` 才能完整运行 DevTools。换句话说，仓库现在可以独立保存和迭代前端代码，但还不是完全自包含的交付物。

## 1. 核心问题：架构元数据解耦

目前前端的 DevTools 模块在 `src/cells/devtools/shared/parser.ts` 中使用了 Vite 的 `import.meta.glob` 直接读取 `../gocell` 仓库里的 YAML 文件。这能恢复本地开发功能，但也意味着：

- 本仓库单独 clone 后，DevTools 元数据不会完整可用。
- Docker/CI 如果没有把 `../gocell` 一并挂进来，DevTools 相关功能不能视为真正完成解耦。

### 待实现：Metadata API
**需求**：在 Go 后端提供一个统一的接口。
- **Endpoint**: `GET /api/v1/devtools/metadata`
- **功能**：由后端读取并解析以下目录的 YAML 文件，并以 JSON 格式返回给前端：
  - `cells/*/cell.yaml`
  - `cells/*/slices/*/slice.yaml`
  - `contracts/**/contract.yaml`
  - `assemblies/*/assembly.yaml`
  - `journeys/J-*.yaml`
  - `journeys/status-board.yaml`

### 前端适配计划
一旦 API 就绪，前端需要：
1. 修改 `parser.ts`，将静态的文件 glob 替换为对该 API 的异步调用。
2. 移除所有指向 sibling repo 的本地文件系统路径。

## 2. 环境与部署变更

### 构建依赖
- **前端源码已恢复**：`src/` 已从旧单体中的 `web/src` 补迁到当前仓库。
- **本地开发依赖**：DevTools 仍需要 `../gocell` 提供 `cells/`, `contracts/`, `assemblies/`, `journeys/` 元数据。
- **注意**：`Dockerfile` 只打包当前仓库内容，因此“页面能构建”不等于“DevTools 数据链路已完全独立”。

### 代理配置
- 目前 `vite.config.ts` 中的代理指向 `localhost:8081/8082/8083`。
- 在生产环境或联调环境，可能需要后端通过环境变量或 Nginx 配置来统一处理 API 网关。

## 3. 已知遗留问题 (Technical Debt)

- **仓库仍不完全自包含**：缺少 `../gocell` 时，DevTools 页面会因为取不到元数据而显示空数据或失去分析价值。
- **跨域 (CORS)**：如果前后端分离部署，后端需配置 CORS 允许前端域名的访问。
- **部署链路未完全解耦**：要想让 `gocell-web` 独立部署，仍需实现 Metadata API，或者把所需元数据在构建前同步到当前仓库。
