import { describe, it, expect, vi } from 'vitest'
import { fetchUsers, createUser } from './api'
import client from '@/shared/api/client'

vi.mock('@/shared/api/client', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    }
  }
})

describe('User Manage API', () => {
  it('calls GET /api/v1/access/users', async () => {
    // @ts-ignore
    client.get.mockResolvedValueOnce({ data: { data: [{ id: '1', username: 'admin' }] } })
    const users = await fetchUsers()
    expect(client.get).toHaveBeenCalledWith('/api/v1/access/users')
    expect(users).toHaveLength(1)
  })

  it('calls POST /api/v1/access/users', async () => {
    // @ts-ignore
    client.post.mockResolvedValueOnce({ data: { data: { id: 'new-id' } } })
    const result = await createUser({ username: 'test_user', email: 'test@example.com' })
    expect(client.post).toHaveBeenCalledWith('/api/v1/access/users', { username: 'test_user', email: 'test@example.com' })
    expect(result.id).toBe('new-id')
  })
})
