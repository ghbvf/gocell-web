import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import MockAdapter from 'axios-mock-adapter'
import { http } from '@gocell/request'
import { useIdentitiesStore } from './useIdentitiesStore'
import { USERS_URL, type Identity } from '../api/identities'

const mkUser = (over: Partial<Identity> = {}): Identity => ({
  id: 'u-1',
  username: 'alice',
  email: 'alice@corp.example',
  status: 'active',
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-02T00:00:00Z',
  ...over,
})

describe('useIdentitiesStore', () => {
  let mock: MockAdapter

  beforeEach(() => {
    setActivePinia(createPinia())
    mock = new MockAdapter(http)
  })

  afterEach(() => {
    mock.restore()
  })

  it('starts empty and not loading', () => {
    const store = useIdentitiesStore()
    expect(store.users).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.errorKey).toBeNull()
    expect(store.hasMore).toBe(false)
  })

  describe('fetchList', () => {
    it('toggles loading and populates users + pagination on success', async () => {
      mock.onGet(USERS_URL).reply(200, { data: [mkUser()], nextCursor: 'cur-2', hasMore: true })
      const store = useIdentitiesStore()

      const p = store.fetchList()
      expect(store.loading).toBe(true)
      await p

      expect(store.loading).toBe(false)
      expect(store.users).toHaveLength(1)
      expect(store.users[0]?.username).toBe('alice')
      expect(store.nextCursor).toBe('cur-2')
      expect(store.hasMore).toBe(true)
      expect(store.errorKey).toBeNull()
    })

    it('requests the first page with a limit', async () => {
      let seen: Record<string, unknown> | undefined
      mock.onGet(USERS_URL).reply((c) => {
        seen = c.params as Record<string, unknown>
        return [200, { data: [], nextCursor: '', hasMore: false }]
      })
      await useIdentitiesStore().fetchList()
      expect(seen).toMatchObject({ limit: expect.any(Number) })
      expect(seen).not.toHaveProperty('cursor')
    })

    it('maps a network failure to errors.network and leaves users untouched', async () => {
      mock.onGet(USERS_URL).networkError()
      const store = useIdentitiesStore()
      await store.fetchList()
      expect(store.errorKey).toBe('errors.network')
      expect(store.loading).toBe(false)
      expect(store.users).toEqual([])
    })

    it('maps a 403 envelope to its i18n error key', async () => {
      mock.onGet(USERS_URL).reply(403, { error: { code: 'ERR_AUTH_FORBIDDEN' } })
      const store = useIdentitiesStore()
      await store.fetchList()
      expect(store.errorKey).toBe('errors.ERR_AUTH_FORBIDDEN')
    })

    it('clears a prior error key on a subsequent successful fetch', async () => {
      const store = useIdentitiesStore()
      mock.onGet(USERS_URL).networkError()
      await store.fetchList()
      expect(store.errorKey).toBe('errors.network')

      mock.reset()
      mock.onGet(USERS_URL).reply(200, { data: [mkUser()], nextCursor: '', hasMore: false })
      await store.fetchList()
      expect(store.errorKey).toBeNull()
    })
  })

  describe('filteredUsers', () => {
    beforeEach(async () => {
      mock.onGet(USERS_URL).reply(200, {
        data: [
          mkUser({ id: 'u-1', username: 'alice', email: 'alice@corp.example' }),
          mkUser({ id: 'u-2', username: 'bob', email: 'bob@other.example' }),
        ],
        nextCursor: '',
        hasMore: false,
      })
      await useIdentitiesStore().fetchList()
    })

    it('returns all users when the filter is empty', () => {
      const store = useIdentitiesStore()
      expect(store.filteredUsers).toHaveLength(2)
    })

    it('filters by username substring, case-insensitively', () => {
      const store = useIdentitiesStore()
      store.filter = 'ALI'
      expect(store.filteredUsers.map((u) => u.id)).toEqual(['u-1'])
    })

    it('filters by email substring', () => {
      const store = useIdentitiesStore()
      store.filter = 'other.example'
      expect(store.filteredUsers.map((u) => u.id)).toEqual(['u-2'])
    })

    it('returns no rows when nothing matches', () => {
      const store = useIdentitiesStore()
      store.filter = 'zzz'
      expect(store.filteredUsers).toEqual([])
    })
  })

  describe('loadMore', () => {
    it('appends the next page using the stored cursor', async () => {
      const store = useIdentitiesStore()
      mock.onGet(USERS_URL).replyOnce(200, {
        data: [mkUser({ id: 'u-1' })],
        nextCursor: 'cur-2',
        hasMore: true,
      })
      await store.fetchList()

      let seen: Record<string, unknown> | undefined
      mock.onGet(USERS_URL).replyOnce((c) => {
        seen = c.params as Record<string, unknown>
        return [
          200,
          { data: [mkUser({ id: 'u-2', username: 'bob' })], nextCursor: '', hasMore: false },
        ]
      })
      await store.loadMore()

      expect(seen).toMatchObject({ cursor: 'cur-2' })
      expect(store.users.map((u) => u.id)).toEqual(['u-1', 'u-2'])
      expect(store.hasMore).toBe(false)
    })

    it('is a no-op when there is no next page', async () => {
      const store = useIdentitiesStore()
      await store.loadMore()
      expect(mock.history.get).toHaveLength(0)
    })
  })
})
