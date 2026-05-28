---
name: project-pdp-core
description: PR-04 @gocell/core 的 PDP 注入契约实施状态（Can + useDecision + types）
metadata:
  type: project
---

PDP UI 壳已在 `packages/core/src/pdp/` + `packages/core/src/components/Can.vue` 实施完毕（worktree 005-b0-request-auth）。

**Why:** core 只放 UI 壳和注入契约，PDP client 实现在 @gocell/access，避免 core 依赖业务包。fail-closed 是铁律：无 provider / pending / error 一律返回 false。

**How to apply:** @gocell/access 实施时需要 `import { PDP_INJECTION_KEY, type PdpClient } from '@gocell/core'`，然后 `app.provide(PDP_INJECTION_KEY, pdpClientImpl)` 装配。PDP_INJECTION_KEY 通过主入口 `.` 可达，不需要额外 paths 条目。

核心交付：
- `packages/core/src/pdp/types.ts` — PdpClient interface + PDP_INJECTION_KEY
- `packages/core/src/pdp/useDecision.ts` — 响应式 composable，fail-closed
- `packages/core/src/components/Can.vue` — mode=hide/disable，scoped slot { allowed }
- `packages/core/package.json#exports` 新增 `"./components"`

vitest 加了 @vitejs/plugin-vue（catalog 中已有，只是 core 的 devDeps 没声明）。

PR-04 @gocell/access 已交付（worktree 005-b0-request-auth）：
- `packages/access/src/stores/useAuthStore.ts` — Pinia store `access.auth`；全内存 token；refresh() 是 setupAxios 的 onRefresh 回调（PR-06 装配）
- `packages/access/src/pdp/createPdpClient.ts` — PdpClient 实现；reactive Record 缓存 + 5min TTL + fail-closed；BR-004 stub 注释标注
- barrel: `stores/index.ts`、`pdp/index.ts`、`src/index.ts`（re-export useAuthStore/AuthUser/createPdpClient）
- 20 tests all green（11 auth + 9 pdp）；typecheck + -w typecheck 全通
