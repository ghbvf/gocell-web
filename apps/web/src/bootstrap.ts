/**
 * bootstrap.ts — Application assembly layer.
 *
 * Wires:
 *  1. setupAxios: auth callbacks (getToken / onRefresh / onAuthFail)
 *  2. configureAxios() — exposed for testability (stub router, no full app)
 *  3. bootstrapSession() — silent session restore on app start
 *
 * PDP provide is done in main.ts after app creation (requires app instance).
 */
import type { Router } from 'vue-router'
import { setupAxios } from '@gocell/request'
import { useAuthStore } from '@gocell/access'

/**
 * Configure the axios instance with auth callbacks.
 * Must be called AFTER createPinia() + setActivePinia() so useAuthStore() works.
 *
 * @param router — needed for onAuthFail redirect to /login
 */
export function configureAxios(router: Router): void {
  const auth = useAuthStore()

  setupAxios({
    getToken: () => auth.accessToken,
    onRefresh: () => auth.refresh(),
    onAuthFail: () => {
      auth.clearSession()
      // Refresh exhausted → bounce to login with a reason the LoginView surfaces
      // as a "session expired" notice. NavigationFailure (already on /login) is
      // swallowed.
      router.push({ name: 'login', query: { reason: 'expired' } }).catch(() => {
        // Intentionally ignored
      })
    },
    refreshPath: '/sessions/refresh',
  })
}

/** In-flight memo so concurrent / repeat callers share one restore attempt. */
let bootstrapPromise: Promise<void> | null = null

/**
 * Attempt to restore a session on app start via a single refresh, before the
 * first route guard evaluates auth.
 *
 * Idempotent. With the current body-based, in-memory refresh token (no httpOnly
 * cookie yet — see issue #12 H2), a cold load has no token so authStore.refresh()
 * short-circuits to null and this is a silent no-op; the guards then route
 * protected pages to /login. The seam is in place for when the backend adds a
 * refresh cookie that survives reload.
 *
 * Must be called AFTER createPinia() so useAuthStore() resolves.
 */
export function bootstrapSession(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise
  const auth = useAuthStore()
  bootstrapPromise = auth.refresh().then(() => undefined)
  return bootstrapPromise
}
