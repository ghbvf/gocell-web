import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { http } from '@gocell/request'
import { listUsers, USERS_URL } from './identities'

const page = {
  data: [
    {
      id: 'u-1',
      username: 'alice',
      email: 'alice@corp.example',
      status: 'active',
      createdAt: '2026-05-01T00:00:00Z',
      updatedAt: '2026-05-02T00:00:00Z',
    },
  ],
  nextCursor: 'cur-2',
  hasMore: true,
}

describe('identities api · listUsers', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(http)
  })

  afterEach(() => {
    mock.restore()
  })

  it('GETs the users collection URL and returns the list envelope', async () => {
    mock.onGet(USERS_URL).reply(200, page)
    const res = await listUsers()
    expect(res).toEqual(page)
  })

  it('forwards cursor + limit as query params', async () => {
    let seenParams: Record<string, unknown> | undefined
    mock.onGet(USERS_URL).reply((config) => {
      seenParams = config.params as Record<string, unknown>
      return [200, page]
    })
    await listUsers({ cursor: 'cur-1', limit: 25 })
    expect(seenParams).toEqual({ cursor: 'cur-1', limit: 25 })
  })

  it('sends no query params when called without args', async () => {
    let seenParams: Record<string, unknown> | undefined
    mock.onGet(USERS_URL).reply((config) => {
      seenParams = config.params as Record<string, unknown>
      return [200, page]
    })
    await listUsers()
    expect(seenParams).toEqual({})
  })

  it('rejects on network failure (interceptor maps the error upstream)', async () => {
    mock.onGet(USERS_URL).networkError()
    await expect(listUsers()).rejects.toThrow()
  })
})
