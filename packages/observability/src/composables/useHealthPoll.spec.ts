import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHealthPoll } from './useHealthPoll'

// Mock onScopeDispose to avoid "getCurrentInstance is null" warning in test env
// (same pattern as useGlobalShortcuts.spec.ts)
vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue')>()
  return {
    ...actual,
    onScopeDispose: vi.fn(),
  }
})

// Mock the health store so we can spy on refresh()
vi.mock('../stores/useHealthStore', () => {
  const mockRefresh = vi.fn().mockResolvedValue(undefined)
  const mockStore = { refresh: mockRefresh }
  return {
    useHealthStore: vi.fn(() => mockStore),
  }
})

// Pull these after mock setup to get the mocked versions
import { onScopeDispose } from 'vue'
import { useHealthStore } from '../stores/useHealthStore'

describe('useHealthPoll', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls refresh() immediately on invocation', () => {
    const store = useHealthStore()
    useHealthPoll()
    expect(store.refresh).toHaveBeenCalledOnce()
  })

  it('calls refresh() again after the interval elapses', () => {
    const store = useHealthStore()
    useHealthPoll(5_000)
    expect(store.refresh).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(5_000)
    expect(store.refresh).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(5_000)
    expect(store.refresh).toHaveBeenCalledTimes(3)
  })

  it('uses default interval of 30 000 ms', () => {
    const store = useHealthStore()
    useHealthPoll()
    expect(store.refresh).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(29_999)
    expect(store.refresh).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1)
    expect(store.refresh).toHaveBeenCalledTimes(2)
  })

  it('registers onScopeDispose for cleanup', () => {
    useHealthPoll()
    expect(onScopeDispose).toHaveBeenCalledOnce()
    expect(onScopeDispose).toHaveBeenCalledWith(expect.any(Function))
  })

  it('stop() prevents further refresh calls after being called', () => {
    const store = useHealthStore()
    const { stop } = useHealthPoll(5_000)
    expect(store.refresh).toHaveBeenCalledTimes(1)

    stop()
    vi.advanceTimersByTime(10_000)
    // No additional calls after stop()
    expect(store.refresh).toHaveBeenCalledTimes(1)
  })

  it('returns { stop } handle', () => {
    const result = useHealthPoll()
    expect(result).toHaveProperty('stop')
    expect(typeof result.stop).toBe('function')
  })

  it('stop() is the same function registered with onScopeDispose', () => {
    const { stop } = useHealthPoll()
    const disposeFn = vi.mocked(onScopeDispose).mock.calls[0]?.[0]
    expect(disposeFn).toBe(stop)
  })
})
