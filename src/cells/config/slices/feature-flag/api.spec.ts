import { describe, it, expect, vi } from 'vitest'
import { fetchFlags } from './api'
import client from '@/shared/api/client'

vi.mock('@/shared/api/client', () => {
  return {
    default: {
      get: vi.fn(),
      put: vi.fn()
    }
  }
})

describe('Feature Flag API', () => {
  it('calls GET /api/v1/flags', async () => {
    // @ts-ignore
    client.get.mockResolvedValueOnce({ data: { data: [{ key: 'new_ui', enabled: true }] } })
    const flags = await fetchFlags()
    expect(client.get).toHaveBeenCalledWith('/api/v1/flags')
    expect(flags).toHaveLength(1)
  })


})
