/**
 * guards.ts — 路由守卫三段（T020）
 *
 * 顺序（不可颠倒）：
 *   1. first-run 门：检查后端是否已初始化（hasAdmin）
 *   2. 认证门：未登录保护路由 → /login
 *   3. PDP 授权门：to.meta.requiredAction → PDP can() 评估
 *
 * 设计要点：
 *  - first-run: fail-open（请求失败放行）；结果缓存防止每次导航都打 API
 *  - auth: requiresAuth 默认 true；meta.requiresAuth === false 或 meta.public 放行
 *  - PDP: fail-closed；仅当明确 allowed 时通过（ComputedRef.value 读取）
 */
import type { Router } from 'vue-router'
import type { App } from 'vue'
import { useAuthStore } from '@gocell/access'
import { http } from '@gocell/request'
import type { PdpClient } from '@gocell/core'
import type { HttpAuthSetupStatusV1Response } from '@gocell/contracts'

const SETUP_STATUS_URL = '/api/v1/access/setup/status'

/** cached result: undefined = not yet fetched, boolean = fetched */
let _setupStatusCache: boolean | undefined = undefined

async function fetchSetupStatus(): Promise<boolean> {
  if (_setupStatusCache !== undefined) return _setupStatusCache

  try {
    const res = await http.get<HttpAuthSetupStatusV1Response>(SETUP_STATUS_URL)
    // hasAdmin: true  → setup done → no redirect
    // hasAdmin: false → needs setup → redirect
    const needsSetup = !res.data.data.hasAdmin
    _setupStatusCache = needsSetup
    return needsSetup
  } catch {
    // Request failed / backend not reachable → fail-open: do not block app startup
    console.warn('[guards] setup/status request failed; skipping first-run gate')
    _setupStatusCache = false
    return false
  }
}

/**
 * Reset the first-run cache — intended for test isolation.
 * @internal
 */
export function _resetSetupStatusCache(): void {
  _setupStatusCache = undefined
}

/**
 * Register the three-stage beforeEach guard on the router.
 *
 * @param router   — Vue Router instance
 * @param app      — Vue App instance (used to inject PDP client via app.config.globalProperties)
 * @param pdpClient — Optional PDP client override; used in tests. In production
 *                    main.ts provides it via app.provide() and passes it here.
 */
export function registerGuards(router: Router, app: App, pdpClient?: PdpClient): void {
  router.beforeEach(async (to) => {
    // ── Stage 1: first-run gate ─────────────────────────────────────────────
    // Already on the setup or login page → skip to avoid infinite redirect
    if (to.name !== 'first-run-setup' && to.name !== 'login') {
      const needsSetup = await fetchSetupStatus()
      if (needsSetup) {
        return { name: 'first-run-setup' }
      }
    }

    // ── Stage 2: auth gate ──────────────────────────────────────────────────
    const isPublic = to.meta['requiresAuth'] === false || to.meta['public'] === true
    if (!isPublic) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        return { name: 'login', query: { redirect: to.fullPath } }
      }
    }

    // ── Stage 3: PDP gate ───────────────────────────────────────────────────
    const requiredAction = to.meta['requiredAction']
    if (typeof requiredAction === 'string') {
      // Resolve PDP client: explicit override > app global property > fail-closed
      const client: PdpClient | undefined = pdpClient

      if (!client) {
        // PDP client not wired yet (Batch 0 fallback) → fail-closed
        console.warn('[guards] PDP client not provided; denying access to', to.path)
        return { name: 'home' }
      }

      const resource =
        typeof to.meta['requiredResource'] === 'string' ? to.meta['requiredResource'] : undefined

      const allowed = client.can(requiredAction, resource)
      if (!allowed.value) {
        return { name: 'home' }
      }
    }

    // All gates passed
    return true
  })

  // Keep app param referenced to satisfy TS — may be used in future for app.inject()
  void app
}
