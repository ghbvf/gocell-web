import { describe, it, expect, vi } from 'vitest'
import { registerDevice, getDeviceStatus, fetchDevices } from './api'
import client from '@/shared/api/client'

vi.mock('@/shared/api/client', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn()
    }
  }
})

describe('Device Manage API', () => {
  it('calls POST /api/v1/devices', async () => {
    // @ts-ignore
    client.post.mockResolvedValueOnce({ data: { data: { id: 'd1' } } })
    const res = await registerDevice({ name: 'test', macAddress: '00:00' })
    expect(client.post).toHaveBeenCalledWith('/api/v1/devices', { name: 'test', macAddress: '00:00' })
    expect(res.id).toBe('d1')
  })

  it('calls GET /api/v1/devices/:id/status', async () => {
    // @ts-ignore
    client.get.mockResolvedValueOnce({ data: { data: { online: true } } })
    const status = await getDeviceStatus('d1')
    expect(client.get).toHaveBeenCalledWith('/api/v1/devices/d1/status')
    expect(status.online).toBe(true)
  })

  it('calls GET /api/v1/devices', async () => {
    // @ts-ignore
    client.get.mockResolvedValueOnce({ data: { data: [] } })
    await fetchDevices()
    expect(client.get).toHaveBeenCalledWith('/api/v1/devices')
  })
})
