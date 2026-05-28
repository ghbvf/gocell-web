---
name: request-package-di-pattern
description: @gocell/request uses setupAxios DI callbacks for token/refresh/authFail — never imports @gocell/access; _resetForTesting exported for test isolation
metadata:
  type: project
---

`@gocell/request` avoids circular dependency with `@gocell/access` by injecting all auth concerns via `setupAxios(opts: SetupAxiosOptions)` callbacks. `apps/web` wires these up at startup (PR-06).

**Why:** request → access → request would be circular. DI keeps request as pure infra.

**How to apply:** Any future infra package that needs auth callbacks should follow the same DI pattern, not import access directly. The `_resetForTesting` export (not in index.ts) pattern is approved for test isolation of module-level state.

Single-flight refresh uses module-level `isRefreshing` + `refreshPromise` + `waitQueue`. All concurrent 401 callers (including the first) push to the queue; `flushQueue`/`rejectQueue` resolves them all when refresh completes.
