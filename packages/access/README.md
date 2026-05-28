# @gocell/access

> 对应后端 cell：`cells/accesscore`

auth store（全内存 token）+ PDP client（fail-closed stub）的实现包。

## 对外 exports

| 入口 | 内容 |
|---|---|
| `.` (`src/index.ts`) | `useAuthStore`、`AuthUser`（type）、`createPdpClient` |
| `./stores` (`src/stores/index.ts`) | `useAuthStore`、`AuthUser`（type）（按需导入 store 时用） |

## 依赖的 contract

| contract | 用途 |
|---|---|
| `HttpAuthLoginV1Response` | login 响应 data 字段（由 `apps/web` 在装配层消费后调 `setSession`） |
| `HttpAuthRefreshV1Response` | `useAuthStore.refresh()` 内部消费 |

contract 来源：`@gocell/contracts`（codegen 派生，只读）。

## 提供给其他包的能力

### `useAuthStore` (Pinia store `access.auth`)

- **state**：`user: AuthUser | null`、`accessToken: string | null`、`refreshToken: string | null`、`passwordResetRequired: boolean`
- **getter**：`isAuthenticated: boolean`
- **actions**：`setSession(payload)`、`clearSession()`、`refresh(): Promise<string | null>`
- 安全铁律：access token / refresh token **仅内存**，绝不写 localStorage / sessionStorage。

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

覆盖：`useAuthStore`（T024，11 cases）、`createPdpClient`（fail-closed + cache + TTL，9 cases）。
