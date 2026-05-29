/**
 * bootstrap.ts — Application assembly layer.
 *
 * Wires:
 *  1. setupAxios: auth callbacks (getToken / onRefresh / onAuthFail)
 *  2. Exposes configureAxios() for testability — tests can call it with a
 *     stub router without mounting a full Vue app.
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
      // /login route not yet built in Batch 0; NavigationFailure is swallowed.
      router.push({ name: 'login' }).catch(() => {
        // Intentionally ignored — route will exist after PR-07
      })
    },
    refreshPath: '/sessions/refresh',
  })
}
