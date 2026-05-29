import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toI18nKey } from '@gocell/request'
import { listUsers, type Identity } from '../api/identities'

/** Server page size for the cursor-paginated user list (BR-005). */
const PAGE_SIZE = 50

/**
 * access.identities — user-identity list state (MVP: `type=user`).
 *
 * Owns server-list state (rows, cursor, loading, error) + a client-side
 * quick-filter. Mutation actions (create/lock/unlock/change-password/…) land
 * with the operation modals (PR-10); this slice is read-only.
 */
export const useIdentitiesStore = defineStore('access.identities', () => {
  // ─── state ──────────────────────────────────────────────────────────────
  const users = ref<Identity[]>([])
  const loading = ref(false)
  const errorKey = ref<string | null>(null)
  const nextCursor = ref('')
  const hasMore = ref(false)
  /** Client-side quick-filter over the loaded page (BR-005: no server filter yet). */
  const filter = ref('')

  // ─── getters ────────────────────────────────────────────────────────────
  const filteredUsers = computed<Identity[]>(() => {
    const q = filter.value.trim().toLowerCase()
    if (!q) return users.value
    return users.value.filter(
      (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  })

  // ─── actions ──────────────────────────────────────────────────────────────

  /** Fetch the first page, replacing any current rows. */
  async function fetchList(): Promise<void> {
    loading.value = true
    errorKey.value = null
    try {
      const page = await listUsers({ limit: PAGE_SIZE })
      users.value = page.data
      nextCursor.value = page.nextCursor
      hasMore.value = page.hasMore
    } catch (err: unknown) {
      // Keep the last good rows on a refetch failure; surface the i18n key.
      errorKey.value = toI18nKey(err)
    } finally {
      loading.value = false
    }
  }

  /** Append the next page; no-op when there is none or a request is in flight. */
  async function loadMore(): Promise<void> {
    if (!hasMore.value || loading.value) return
    loading.value = true
    errorKey.value = null
    try {
      const page = await listUsers({ cursor: nextCursor.value, limit: PAGE_SIZE })
      users.value = [...users.value, ...page.data]
      nextCursor.value = page.nextCursor
      hasMore.value = page.hasMore
    } catch (err: unknown) {
      errorKey.value = toI18nKey(err)
    } finally {
      loading.value = false
    }
  }

  return {
    // state
    users,
    loading,
    errorKey,
    nextCursor,
    hasMore,
    filter,
    // getters
    filteredUsers,
    // actions
    fetchList,
    loadMore,
  }
})
