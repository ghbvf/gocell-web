/**
 * guards.ts — 路由守卫三段（T020）
 *
 * 顺序（不可颠倒）：
 *   1. first-run 门：检查后端是否已初始化（hasAdmin）
 *   2. 认证门：未登录保护路由 → /login
 *   3. PDP 授权门：to.meta.requiredAction → PDP can() 评估
 *
 * 设计要点：
 *  - first-run: fail-open（请求失败放行）；**只缓存"已完成 setup"（needsSetup=false）
 *    的结果**；needsSetup=true 时不缓存，每次导航重新查，直到 setup 完成后某次
 *    查到 false 才缓存，破除 first-run 完成后仍死循环重定向的问题。
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

/**
 * Cached result: undefined = not yet fetched or setup not done yet;
 * false = setup is done (hasAdmin=true), safe to cache permanently.
 *
 * We ONLY cache the "setup done" state (needsSetup=false).
 * When needsSetup=true, we do NOT cache so that the next navigation
 * re-fetches and detects when setup has been completed.
 * This prevents an infinite redirect loop after first-run completes.
 */
let _setupStatusCache: false | undefined = undefined

async function fetchSetupStatus(): Promise<boolean> {
  // Only serve from cache when we know setup is done
  if (_setupStatusCache === false) return false

  try {
    const res = await http.get<HttpAuthSetupStatusV1Response>(SETUP_STATUS_URL)
    // hasAdmin: true  → setup done → no redirect
    // hasAdmin: false → needs setup → redirect
    const needsSetup = !res.data.data.hasAdmin
    if (!needsSetup) {
      // Cache only the "setup done" result — prevents repeated API calls once setup completes
      _setupStatusCache = false
    }
    // needsSetup=true: do NOT cache — re-fetch on next navigation until setup completes
    return needsSetup
  } catch {
    // Request failed / backend not reachable → fail-open: do not block app startup
    // Do NOT cache failure — retry on next navigation
    console.warn('[guards] setup/status request failed; skipping first-run gate')
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
