import { describe, it, expect } from 'vitest'
import { router } from './index'

/**
 * Asserts the structural layout fork: auth pages resolve standalone (a single
 * matched record), while in-shell pages resolve nested under AppShellLayout
 * (≥ 2 matched records). This is what keeps login / first-run out of the shell
 * chrome without relying on a runtime meta flag.
 */
describe('router layout fork', () => {
  it('renders /login standalone (no shell layout wrapper)', () => {
    const m = router.resolve('/login')
    expect(m.name).toBe('login')
    expect(m.matched).toHaveLength(1)
  })

  it('renders /first-run-setup standalone', () => {
    const m = router.resolve('/first-run-setup')
    expect(m.name).toBe('first-run-setup')
    expect(m.matched).toHaveLength(1)
  })

  it('renders / nested under the shell layout', () => {
    const m = router.resolve('/')
    expect(m.name).toBe('home')
    expect(m.matched.length).toBeGreaterThanOrEqual(2)
  })

  it('keeps auth routes public', () => {
    expect(router.resolve('/login').meta.public).toBe(true)
    expect(router.resolve('/first-run-setup').meta.public).toBe(true)
  })

  it('renders /access/identities nested under the shell, behind the auth + PDP gates', () => {
    const m = router.resolve('/access/identities')
    expect(m.name).toBe('access-identities')
    expect(m.matched.length).toBeGreaterThanOrEqual(2)
    expect(m.meta.requiresAuth).toBe(true)
    // PDP fail-closed gate (read on identity) — guards.ts denies until the PDP backend allows.
    expect(m.meta.requiredAction).toBe('read')
    expect(m.meta.requiredResource).toBe('identity')
  })
})
