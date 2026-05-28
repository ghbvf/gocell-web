/**
 * guards.spec.ts — 路由守卫三段测试（T026）
 *
 * 守卫顺序：first-run → auth → PDP
 * memory history + createTestingPinia + http mock
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRouter, createMemoryHistory, type Router, type RouteLocationRaw } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { http } from '@gocell/request'
import { useAuthStore } from '@gocell/access'
import { registerGuards, _resetSetupStatusCache } from './guards'
import type { PdpClient } from '@gocell/core'
import type { ComputedRef } from 'vue'

/** Helper: create a valid setSession payload */
function makeSession(
  overrides: Partial<Parameters<ReturnType<typeof useAuthStore>['setSession']>[0]> = {},
) {
  return {
    userId: 'u1',
    accessToken: 'tok',
    refreshToken: 'rt',
    expiresAt: '2099-01-01T00:00:00Z',
    sessionId: 'sid-1',
    passwordResetRequired: false,
    ...overrides,
  }
}

// --- Mock @gocell/request http ---
vi.mock('@gocell/request', () => ({
  http: {
    get: vi.fn(),
  },
  setupAxios: vi.fn(),
}))

const httpGet = vi.mocked(http.get)

function makeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'home',
        component: { template: '<div/>' },
        meta: { requiresAuth: false },
      },
      {
        path: '/login',
        name: 'login',
        component: { template: '<div/>' },
        meta: { requiresAuth: false, public: true },
      },
      {
        path: '/first-run-setup',
        name: 'first-run-setup',
        component: { template: '<div/>' },
        meta: { requiresAuth: false, public: true },
      },
      {
        path: '/protected',
        name: 'protected',
        component: { template: '<div/>' },
        // requiresAuth defaults to true (no meta.requiresAuth: false)
      },
      {
        path: '/pdp-guarded',
        name: 'pdp-guarded',
        component: { template: '<div/>' },
        meta: { requiredAction: 'read:resource' },
      },
    ],
  })
}

async function navigate(router: Router, to: RouteLocationRaw): Promise<void> {
  await router.push(to)
  await router.isReady()
}

/** Build a stub PdpClient whose can() returns the given allowed value */
function makePdpClient(allowed: boolean): PdpClient {
  return {
    can: vi.fn().mockReturnValue({ value: allowed } as ComputedRef<boolean>),
  }
}

describe('Router guards', () => {
  let router: Router
  let authStore: ReturnType<typeof useAuthStore>
  let pdpClient: PdpClient

  beforeEach(() => {
    vi.clearAllMocks()
    _resetSetupStatusCache()

    const pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
    pdpClient = makePdpClient(true)

    const app = createApp({ template: '<router-view/>' })
    app.use(pinia)

    router = makeRouter()
    registerGuards(router, app, pdpClient)
    app.use(router)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    _resetSetupStatusCache()
  })

  // ─── First-run gate ───────────────────────────────────────────────────────

  describe('first-run gate', () => {
    it('redirects to /first-run-setup when setup status hasAdmin=false', async () => {
      httpGet.mockResolvedValueOnce({ data: { data: { hasAdmin: false } } })
      authStore.setSession(makeSession())

      await navigate(router, '/protected')

      expect(router.currentRoute.value.name).toBe('first-run-setup')
    })

    it('does NOT redirect when setup status hasAdmin=true', async () => {
      httpGet.mockResolvedValueOnce({ data: { data: { hasAdmin: true } } })
      authStore.setSession(makeSession())

      await navigate(router, '/protected')

      expect(router.currentRoute.value.name).toBe('protected')
    })

    it('allows navigation when setup status request fails (Batch 0 offline)', async () => {
      httpGet.mockRejectedValueOnce(new Error('network error'))
      authStore.setSession(makeSession())

      await navigate(router, '/protected')

      expect(router.currentRoute.value.name).toBe('protected')
    })

    it('does not redirect if already on /first-run-setup', async () => {
      // The guard must NOT redirect away from /first-run-setup even when
      // hasAdmin=false — the page is the destination of the redirect, not a loop.
      // We provide a real mock so the initial route resolution does not error.
      httpGet.mockResolvedValue({ data: { data: { hasAdmin: false } } })

      await navigate(router, '/first-run-setup')

      // Must stay on first-run-setup (no infinite redirect)
      expect(router.currentRoute.value.name).toBe('first-run-setup')
    })

    it('caches setup status result to avoid repeated requests', async () => {
      httpGet.mockResolvedValue({ data: { data: { hasAdmin: true } } })
      authStore.setSession(makeSession())

      await navigate(router, '/protected')
      await navigate(router, '/')
      await navigate(router, '/protected')

      // Only one call because result is cached
      expect(httpGet).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Auth gate ────────────────────────────────────────────────────────────

  describe('auth gate', () => {
    beforeEach(() => {
      // Default: setup is done (hasAdmin=true), first-run gate passes
      httpGet.mockResolvedValue({ data: { data: { hasAdmin: true } } })
    })

    it('redirects unauthenticated user to login for protected route', async () => {
      // Not authenticated
      await navigate(router, '/protected')

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('preserves redirect query param when redirecting to login', async () => {
      await navigate(router, '/protected')

      expect(router.currentRoute.value.query['redirect']).toBe('/protected')
    })

    it('allows authenticated user to access protected route', async () => {
      authStore.setSession(makeSession())

      await navigate(router, '/protected')

      expect(router.currentRoute.value.name).toBe('protected')
    })

    it('allows unauthenticated user to access public "/" route (requiresAuth: false)', async () => {
      await navigate(router, '/')

      expect(router.currentRoute.value.name).toBe('home')
    })

    it('allows unauthenticated user to access /login', async () => {
      await navigate(router, '/login')

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('allows unauthenticated user to access /first-run-setup', async () => {
      await navigate(router, '/first-run-setup')

      expect(router.currentRoute.value.name).toBe('first-run-setup')
    })
  })

  // ─── PDP gate ─────────────────────────────────────────────────────────────

  describe('PDP gate', () => {
    beforeEach(() => {
      httpGet.mockResolvedValue({ data: { data: { hasAdmin: true } } })
      authStore.setSession(makeSession())
    })

    it('allows access when PDP can() returns true', async () => {
      pdpClient = makePdpClient(true)
      // Re-register guards with the new pdpClient
      _resetSetupStatusCache()
      const pinia = createPinia()
      setActivePinia(pinia)
      authStore = useAuthStore()
      authStore.setSession(makeSession())
      const app = createApp({ template: '<router-view/>' })
      app.use(pinia)
      router = makeRouter()
      registerGuards(router, app, pdpClient)
      app.use(router)
      httpGet.mockResolvedValue({ data: { data: { hasAdmin: true } } })

      await navigate(router, '/pdp-guarded')

      expect(router.currentRoute.value.name).toBe('pdp-guarded')
    })

    it('redirects to home when PDP can() returns false (fail-closed)', async () => {
      pdpClient = makePdpClient(false)
      _resetSetupStatusCache()
      const pinia = createPinia()
      setActivePinia(pinia)
      authStore = useAuthStore()
      authStore.setSession(makeSession())
      const app = createApp({ template: '<router-view/>' })
      app.use(pinia)
      router = makeRouter()
      registerGuards(router, app, pdpClient)
      app.use(router)
      httpGet.mockResolvedValue({ data: { data: { hasAdmin: true } } })

      await navigate(router, '/pdp-guarded')

      expect(router.currentRoute.value.name).toBe('home')
    })

    it('does not run PDP gate (can not called) for routes without requiredAction', async () => {
      const canSpy = vi.fn().mockReturnValue({ value: true } as ComputedRef<boolean>)
      pdpClient = { can: canSpy }
      _resetSetupStatusCache()
      const pinia = createPinia()
      setActivePinia(pinia)
      authStore = useAuthStore()
      authStore.setSession(makeSession())
      const app = createApp({ template: '<router-view/>' })
      app.use(pinia)
      router = makeRouter()
      registerGuards(router, app, pdpClient)
      app.use(router)
      httpGet.mockResolvedValue({ data: { data: { hasAdmin: true } } })

      await navigate(router, '/protected')

      expect(canSpy).not.toHaveBeenCalled()
    })
  })

  // ─── Guard ordering ───────────────────────────────────────────────────────

  describe('guard ordering: first-run → auth → PDP', () => {
    it('first-run gate fires before auth gate (unauthenticated → first-run-setup, not login)', async () => {
      httpGet.mockResolvedValueOnce({ data: { data: { hasAdmin: false } } })
      // NOT authenticated

      await navigate(router, '/protected')

      // Should land on first-run-setup, not login (first-run fires first)
      expect(router.currentRoute.value.name).toBe('first-run-setup')
    })

    it('auth gate fires before PDP gate (unauthenticated → login, not home)', async () => {
      // NOT authenticated; PDP would reject too if it ran (but auth fires first)
      const rejecting = makePdpClient(false)
      _resetSetupStatusCache()
      const pinia = createPinia()
      setActivePinia(pinia)
      authStore = useAuthStore()
      // NOT setting session — unauthenticated
      const app = createApp({ template: '<router-view/>' })
      app.use(pinia)
      router = makeRouter()
      registerGuards(router, app, rejecting)
      app.use(router)
      httpGet.mockResolvedValue({ data: { data: { hasAdmin: true } } })

      await navigate(router, '/pdp-guarded')

      // Should land on login (auth gate), not home (PDP gate)
      expect(router.currentRoute.value.name).toBe('login')
    })
  })
})
