import { describe, it, expect, vi } from 'vitest'
import { fetchConfigs, setConfig, getConfig } from './api'
import client from '@/shared/api/client'

vi.mock('@/shared/api/client', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn()
    }
  }
})

describe('Config Manage API', () => {
  it('calls GET /api/v1/config/', async () => {
    // @ts-ignore
    client.get.mockResolvedValueOnce({ data: { data: [{ key: 'timeout', value: '10' }] } })
    const configs = await fetchConfigs()
    expect(client.get).toHaveBeenCalledWith('/api/v1/config/')
    expect(configs).toHaveLength(1)
  })

  it('calls PUT /api/v1/config/:key', async () => {
    // @ts-ignore
    client.put.mockResolvedValueOnce({ data: { data: { version: 2 } } })
    await setConfig('timeout', { value: '20' })
    expect(client.put).toHaveBeenCalledWith('/api/v1/config/timeout', { value: '20' })
  })

  it('calls GET /api/v1/config/:key', async () => {
    // @ts-ignore
    client.get.mockResolvedValueOnce({ data: { data: { key: 'timeout', value: '30' } } })
    const config = await getConfig('timeout')
    expect(client.get).toHaveBeenCalledWith('/api/v1/config/timeout')
    expect(config.value).toBe('30')
  })
})
