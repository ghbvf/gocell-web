import { describe, it, expect, vi } from 'vitest'
import { checkServiceHealth } from './api'
import client from '@/shared/api/client'

vi.mock('@/shared/api/client', () => {
  return {
    default: {
      get: vi.fn(),
    }
  }
})

describe('Health Overview API', () => {
  it('returns false for live and ready on error', async () => {
    // @ts-ignore
    client.get.mockRejectedValue(new Error('Network error'))
    
    const ssoHealth = await checkServiceHealth('sso')
    expect(ssoHealth.name).toBe('sso')
    expect(ssoHealth.live).toBe(false)
    expect(ssoHealth.ready).toBe(false)
  })

  it('fetches healthz and readyz when server is online', async () => {
    // @ts-ignore
    client.get.mockImplementation((url: string) => {
      if (url.endsWith('healthz')) {
        return Promise.resolve({ data: { status: 'healthy' }, status: 200 })
      }
      if (url.endsWith('readyz?verbose')) {
        return Promise.resolve({ data: { status: 'healthy', modules: [] }, status: 200 })
      }
    })
    
    const orderHealth = await checkServiceHealth('order')
    expect(orderHealth.name).toBe('order')
    expect(orderHealth.live).toBe(true)
    expect(orderHealth.ready).toBe(true)
    expect(client.get).toHaveBeenCalledWith('/order/healthz')
    expect(client.get).toHaveBeenCalledWith('/order/readyz?verbose')
  })
})
