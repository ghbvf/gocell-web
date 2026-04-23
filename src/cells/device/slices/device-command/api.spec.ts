import { describe, it, expect, vi } from 'vitest'
import { fetchCommands, sendCommand, ackCommand } from './api'
import client from '@/shared/api/client'

vi.mock('@/shared/api/client', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn()
    }
  }
})

describe('Device Command API', () => {
  it('calls POST /api/v1/devices/:id/commands', async () => {
    // @ts-ignore
    client.post.mockResolvedValueOnce({ data: { data: { id: 'c1' } } })
    const res = await sendCommand('d1', { payload: 'ON' })
    expect(client.post).toHaveBeenCalledWith('/api/v1/devices/d1/commands', { payload: 'ON' })
    expect(res.id).toBe('c1')
  })

  it('calls GET /api/v1/devices/:id/commands', async () => {
    // @ts-ignore
    client.get.mockResolvedValueOnce({ data: { data: [] } })
    await fetchCommands('d1')
    expect(client.get).toHaveBeenCalledWith('/api/v1/devices/d1/commands')
  })

  it('calls POST /api/v1/devices/:id/commands/:cmdId/ack', async () => {
    // @ts-ignore
    client.post.mockResolvedValueOnce({ data: {} })
    await ackCommand('d1', 'c1')
    expect(client.post).toHaveBeenCalledWith('/api/v1/devices/d1/commands/c1/ack')
  })
})
