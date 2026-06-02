# @gocell/config

> 对应后端 cell：`cells/configcore/`

Configuration entry management (config CRUD + stage/publish + version + rollback).
Feature flags 由 C2 agent 追加。

## 对外 exports

- `.` → 主入口：`useConfigStore`, `ConfigEntry` type（C2 追加 flags 导出）
- `./stores` → `useConfigStore`（C2 追加 `useFlagsStore`）
- `./views/config` → `ConfigView.vue`（配置项页面）
- `./views/flags` → `FlagsView.vue`（C2 实现）
- `./composables` → composables 入口（C2 如需可追加）

## 依赖的 contract

- `HttpConfigListV1Response` (`http/config/list/v1/response.ts`)
- `HttpConfigGetV1Response` (`http/config/get/v1/response.ts`)
- `HttpConfigWriteV1Request` (`http/config/write/v1/request.ts`)
- `HttpConfigUpdateV1Request` (`http/config/update/v1/request.ts`)
- `HttpConfigPublishV1Response` (`http/config/publish/v1/response.ts`)
- `HttpConfigRollbackV1Request` (`http/config/rollback/v1/request.ts`)
- `HttpConfigRollbackV1Response` (`http/config/rollback/v1/response.ts`)

## 能力（config 域）

- `useConfigStore` — Pinia setup store (id: `config.entries`)
  - state: `entries`, `loading`, `errorKey`, `nextCursor`, `hasMore`, `filter`, `mutating`
  - getters: `filteredEntries` (client-side key filter)
  - read: `fetchList()`, `loadMore()`
  - mutations (re-throw on failure): `create()`, `update()` (CAS), `publish()`, `rollback()` (CAS), `remove()`
  - sensitive write guard: `create`/`update` reject if `value === "******"`
- `ConfigEntry` — codegen-derived entry type from list contract
- `CONFIG_URL` — `/api/v1/config/` collection URL constant

## 设计决策（降级）

| 决策 | 原因 |
|------|------|
| stage/publish 语义：write/update = 暂存，publish = 快照发布 | 契约无显式 draft 态；UI 副标题说明 |
| sensitive 脱敏：编辑时留空+提示，guard 防止 `"******"` 回写 | 后端 sensitive=true 返回 `"******"` 占位 |
| rollback 手填 version number input（min=1, max=current-1）| 无 version-history 端点（BR-008 pending） |
| CAS 冲突：store mutation re-throw，drawer/dialog inline alert | 409 `ERR_VERSION_CONFLICT` → caller handles |

## 测试

```bash
pnpm -F @gocell/config test --run
pnpm -F @gocell/config test:coverage --run
pnpm -F @gocell/config typecheck
```

## 边界

依赖规则见仓库根 `CLAUDE.md` §依赖规则。跨包仅经 `@gocell/contracts` 类型 + `@gocell/request` client，禁深路径 import。

## 维护者

config 域（config CRUD/stage/publish/rollback）由 C1 agent 实现。
flags 域（feature flags）由 C2 agent 追加（`src/stores/index.ts`、`src/index.ts`、本 README 的 flags 段）。
