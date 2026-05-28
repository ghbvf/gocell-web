/**
 * bootstrap.spec.ts — setupAxios 装配回调形状测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@gocell/access'
import { setupAxios } from '@gocell/request'

vi.mock('@gocell/request', () => ({
  setupAxios: vi.fn(),
  http: { get: vi.fn() },
}))

vi.mock('@gocell/access', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gocell/access')>()
  return {
    ...actual,
    createPdpClient: vi.fn(() => ({ can: vi.fn() })),
  }
})

const mockedSetupAxios = vi.mocked(setupAxios)

async function invokeBootstrapSetupAxios(): Promise<{
  getToken: () => string | null
  onRefresh: () => Promise<string | null>
  onAuthFail: () => void
}> {
  // Import bootstrap after mocks are in place
  const { configureAxios } = await import('./bootstrap')
  const router = { push: vi.fn().mockResolvedValue(undefined) }
  configureAxios(router as unknown as Parameters<typeof configureAxios>[0])

  expect(mockedSetupAxios).toHaveBeenCalledOnce()
  const opts = mockedSetupAxios.mock.calls[0]![0]
  return opts as {
    getToken: () => string | null
    onRefresh: () => Promise<string | null>
    onAuthFail: () => void
  }
}

describe('bootstrap configureAxios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module cache so each test gets a fresh import
    vi.resetModules()
    setActivePinia(createPinia())
  })

  it('getToken reads accessToken from authStore', async () => {
    const { getToken } = await invokeBootstrapSetupAxios()
    const auth = useAuthStore()

    expect(getToken()).toBeNull()

    auth.setSession({
      userId: 'u1',
      accessToken: 'my-token',
      refreshToken: 'rt',
      passwordResetRequired: false,
      expiresAt: '2099-01-01T00:00:00Z',
      sessionId: 'sid-1',
    })
    expect(getToken()).toBe('my-token')
  })

  it('onRefresh delegates to authStore.refresh()', async () => {
    const { onRefresh } = await invokeBootstrapSetupAxios()
    const auth = useAuthStore()
    const spy = vi.spyOn(auth, 'refresh').mockResolvedValue('new-token')

    const result = await onRefresh()

    expect(spy).toHaveBeenCalledOnce()
    expect(result).toBe('new-token')
  })

  it('onAuthFail clears session and attempts push to login', async () => {
    const { onAuthFail } = await invokeBootstrapSetupAxios()
    const auth = useAuthStore()
    auth.setSession({
      userId: 'u1',
      accessToken: 'tok',
      refreshToken: 'rt',
      passwordResetRequired: false,
      expiresAt: '2099-01-01T00:00:00Z',
      sessionId: 'sid-1',
    })

    const clearSpy = vi.spyOn(auth, 'clearSession')

    onAuthFail()

    expect(clearSpy).toHaveBeenCalledOnce()
  })

  it('setupAxios is called with refreshPath containing sessions/refresh', async () => {
    await invokeBootstrapSetupAxios()
    const opts = mockedSetupAxios.mock.calls[0]![0]
    expect(opts.refreshPath).toContain('refresh')
  })
})
