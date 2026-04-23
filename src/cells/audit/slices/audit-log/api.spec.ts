import { describe, it, expect, vi } from 'vitest'
import { fetchAuditLogs } from './api'
import client from '@/shared/api/client'

vi.mock('@/shared/api/client', () => {
  return {
    default: {
      get: vi.fn()
    }
  }
})

describe('Audit Log API', () => {
  it('calls GET /api/v1/audit/entries with correct params', async () => {
    // @ts-ignore
    client.get.mockResolvedValueOnce({ data: { data: [{ id: '1', eventType: 'CREATE' }], hasMore: false, nextCursor: '' } })
    const res = await fetchAuditLogs({ limit: 10, actorId: 'admin' })
    expect(client.get).toHaveBeenCalledWith('/api/v1/audit/entries', { params: { limit: 10, actorId: 'admin' } })
    expect(res.data).toHaveLength(1)
  })
})
