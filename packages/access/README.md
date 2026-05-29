# @gocell/access

> 对应后端 cell：`cells/accesscore`

auth store（全内存 token）+ first-run / login 视图 + PDP client（fail-closed stub）的实现包。

## 对外 exports

| 入口 | 内容 |
|---|---|
| `.` (`src/index.ts`) | `useAuthStore`、`AuthUser`（type）、`createPdpClient` |
| `./stores` (`src/stores/index.ts`) | `useAuthStore`、`AuthUser`（type）（按需导入 store 时用） |
| `./views` (`src/views/index.ts`) | `LoginView`、`FirstRunSetupView`（由 `apps/web` 路由懒加载装配） |

> `api/setup`、`composables/useSetupWizard`、`lib/validation` 是包内私有模块（不在 `exports`），仅供本包 views 消费。

## 依赖的 contract

| contract | 用途 |
|---|---|
| `HttpAuthLoginV1Request/Response` | `useAuthStore.login()` 请求/响应 |
| `HttpAuthRefreshV1Response` | `useAuthStore.refresh()` 内部消费 |
| `HttpAuthSetupStatusV1Response` | `api/setup.fetchSetupStatus()` first-run 门控 |
| `HttpAuthSetupAdminV1Request/Response` | `api/setup.createAdmin()` 首位 admin 创建 |

contract 来源：`@gocell/contracts`（codegen 派生，只读）。

## 提供给其他包的能力

### `useAuthStore` (Pinia store `access.auth`)

- **state**：`user`、`accessToken`、`passwordResetRequired`（内部：`refreshToken`、`sessionId`，不对外暴露）
- **getter**：`isAuthenticated: boolean`
- **actions**：
  - `setSession(payload)` / `clearSession()`
  - `login({ username, password })`：POST `/sessions/login`（带 `__skipAuthRefresh`，401 不触发 refresh），成功 `setSession`，失败抛出（错误带 `i18nKey`）；导航由调用方负责
  - `logout()`：best-effort `DELETE /sessions/{id}` + `clearSession()`
  - `refresh(): Promise<string | null>`：`@gocell/request` 的 `onRefresh` 回调
- 安全铁律：access token / refresh token **仅内存**，绝不写 localStorage / sessionStorage。

### `LoginView` / `FirstRunSetupView` (`./views`)

- 全屏独立布局（不在 `AppShell` 内）；`apps/web` 路由 `() => import('@gocell/access/views')` 懒加载。
- `LoginView`：用户名+密码登录；oracle-safe 错误文案（统一 `ERR_AUTH_LOGIN_FAILED`，不暗示账号存在，PRD R3）。
- `FirstRunSetupView`：5 步引导向导（Preflight `setup/status` → Two planes → Operator(Basic Auth) → Admin(body) → Submit/Done `setup/admin`）；410 静默跳 `/login`（R9）。

### `createPdpClient(): PdpClient`

- 实现 `@gocell/core` 的 `PdpClient` interface（`PDP_INJECTION_KEY`）。
- 在 `apps/web` 装配层 `app.provide(PDP_INJECTION_KEY, createPdpClient())` 注入（PR-06）。
- **PDP stub 状态**：BR-004 §4.1（`/api/v1/access/decide`）后端未交付，端点 404 → fail-closed → 所有 `can()` 恒返回 `false`。缓存 + TTL（5min）+ fail-closed 逻辑已就绪；真实接通见 PR-12 / T306。

## 边界

- 依赖：`@gocell/core`、`@gocell/shared`、`@gocell/contracts`、`@gocell/request`
- 严禁依赖其他业务 cell（`audit`、`config`、`observability`、`devboard`）
- HTTP 调用只走 `@gocell/request` 的 `http` 实例，禁直接 `import axios`

## 测试

```bash
pnpm -F @gocell/access test
pnpm -F @gocell/access typecheck
```

覆盖：`useAuthStore`（含 login/logout）、`createPdpClient`（fail-closed + cache + TTL）、`api/setup`、`lib/validation`、`useSetupWizard`、`LoginView`、`FirstRunSetupView`。整包 ≥ 80%（实测 ~97% lines）。
