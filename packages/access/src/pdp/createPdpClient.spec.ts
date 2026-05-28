import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@gocell/request', () => ({
  http: {
    post: vi.fn(),
  },
}))

import { http } from '@gocell/request'
import { createPdpClient } from './createPdpClient'

const mockHttp = http as unknown as { post: ReturnType<typeof vi.fn> }

/**
 * Flush all microtasks and Vue scheduler ticks.
 * Runs multiple rounds to handle chained async operations.
 */
async function flushPromises(): Promise<void> {
  // Flush microtask queue (settled promises)
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
  await nextTick()
  await nextTick()
}

describe('createPdpClient (fail-closed PDP stub)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('can() returns false initially (fail-closed during pending)', () => {
    // Don't resolve the mock — keep it pending
    mockHttp.post.mockReturnValue(new Promise(() => {}))
    const client = createPdpClient()
    const result = client.can('read', 'cells')
    expect(result.value).toBe(false)
  })

  it('can() becomes true when backend responds allowed=true', async () => {
    mockHttp.post.mockResolvedValueOnce({ data: { data: { allowed: true } } })
    const client = createPdpClient()
    const result = client.can('read', 'cells')

    expect(result.value).toBe(false) // initially false

    await flushPromises()

    expect(result.value).toBe(true)
    expect(mockHttp.post).toHaveBeenCalledWith('/api/v1/access/decide', {
      action: 'read',
      resource: 'cells',
    })
  })

  it('can() stays false when backend responds allowed=false (fail-closed)', async () => {
    mockHttp.post.mockResolvedValueOnce({ data: { data: { allowed: false } } })
    const client = createPdpClient()
    const result = client.can('delete', 'cells')

    await flushPromises()

    expect(result.value).toBe(false)
  })

  it('can() stays false when http.post rejects (fail-closed on error)', async () => {
    mockHttp.post.mockRejectedValueOnce(new Error('network error'))
    const client = createPdpClient()
    const result = client.can('write', 'policies')

    await flushPromises()

    expect(result.value).toBe(false)
  })

  it('can() stays false when backend returns 404-like rejection (fail-closed)', async () => {
    // Simulate a 404 response as a rejection
    mockHttp.post.mockRejectedValueOnce({ response: { status: 404 } })
    const client = createPdpClient()
    const result = client.can('admin', 'system')

    await flushPromises()

    expect(result.value).toBe(false)
  })

  it('same key second can() within TTL does NOT make a second http.post call', async () => {
    mockHttp.post.mockResolvedValue({ data: { data: { allowed: true } } })
    const client = createPdpClient()

    const result1 = client.can('read', 'cells')
    expect(result1.value).toBe(false) // read .value to trigger getter + fetch
    await flushPromises()
    expect(result1.value).toBe(true) // cache populated

    // Second can() with same key — cache hit, no new request
    const result2 = client.can('read', 'cells')
    expect(result2.value).toBe(true) // immediately true from cache
    await flushPromises()

    expect(result2.value).toBe(true)
    // Only ONE network request despite two can() calls
    expect(mockHttp.post).toHaveBeenCalledTimes(1)
  })

  it('different keys each trigger a separate http.post call', async () => {
    mockHttp.post.mockResolvedValue({ data: { data: { allowed: true } } })
    const client = createPdpClient()

    const result1 = client.can('read', 'cells')
    void result1.value // trigger getter
    await flushPromises()

    const result2 = client.can('write', 'policies')
    void result2.value // trigger getter
    await flushPromises()

    expect(result1.value).toBe(true)
    expect(result2.value).toBe(true)
    expect(mockHttp.post).toHaveBeenCalledTimes(2)
  })

  it('TTL expiry causes a new http.post call after 5 minutes', async () => {
    vi.useFakeTimers()
    mockHttp.post.mockResolvedValue({ data: { data: { allowed: true } } })
    const client = createPdpClient()

    const result = client.can('read', 'cells')
    void result.value // trigger getter → fires fetchDecision
    // Flush pending microtasks with fake timers active
    await vi.runAllTimersAsync()

    expect(mockHttp.post).toHaveBeenCalledTimes(1)

    // Advance past 5-minute TTL
    vi.advanceTimersByTime(5 * 60 * 1000 + 1)

    // Re-read the same computed: TTL expired → should trigger new request
    void result.value
    await vi.runAllTimersAsync()

    expect(mockHttp.post).toHaveBeenCalledTimes(2)
  })

  it('can() without resource argument calls http.post with undefined resource', async () => {
    mockHttp.post.mockResolvedValueOnce({ data: { data: { allowed: true } } })
    const client = createPdpClient()
    const result = client.can('list')
    void result.value // trigger getter

    await flushPromises()

    expect(result.value).toBe(true)
    expect(mockHttp.post).toHaveBeenCalledWith('/api/v1/access/decide', {
      action: 'list',
      resource: undefined,
    })
  })
})
