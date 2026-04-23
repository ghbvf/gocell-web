import { describe, it, expect, vi } from 'vitest'
import { login, logout, register } from './api'
import client from '@/shared/api/client'

vi.mock('@/shared/api/client', () => {
  return {
    default: {
      post: vi.fn(),
      delete: vi.fn(),
    }
  }
})

describe('Session API', () => {
  it('calls POST /api/v1/access/sessions/login', async () => {
    // @ts-ignore
    client.post.mockResolvedValueOnce({ data: { data: { accessToken: '123' } } })
    const res = await login({ username: 'test' })
    expect(client.post).toHaveBeenCalledWith('/api/v1/access/sessions/login', { username: 'test' })
    expect(res.accessToken).toBe('123')
  })

  it('calls POST /api/v1/access/users for register', async () => {
    // @ts-ignore
    client.post.mockResolvedValueOnce({ data: { data: { id: '1' } } })
    await register({ username: 'test' })
    expect(client.post).toHaveBeenCalledWith('/api/v1/access/users', { username: 'test' })
  })

  it('calls DELETE /api/v1/access/sessions/:id', async () => {
    // @ts-ignore
    client.delete.mockResolvedValueOnce({})
    await logout('session-id')
    expect(client.delete).toHaveBeenCalledWith('/api/v1/access/sessions/session-id')
  })
})
