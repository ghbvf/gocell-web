import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toI18nKey } from '@gocell/request'
import { listAudit, type AuditEntry } from '../api/audit'
import { classifyActor, groupByDay, type DayGroup } from '../lib/auditClassify'
import { verifyChain, type ChainResult } from '../lib/hashChain'

/** Server page size for the cursor-paginated audit list. */
const PAGE_SIZE = 50

/**
 * audit.query — audit log query state.
 *
 * Owns server-list state (entries, cursor, loading, error) + three client-side
 * quick-filter dimensions (free text / actor kind / action namespace), plus
 * computed getters for filtered rows, day grouping, and hash-chain status.
 *
 * Read actions swallow errors into `errorKey` (rendered inline).
 * Chain verification is computed client-side from loaded entries;
 * the status will be `unavailable` until the backend exposes hash fields (BR-006).
 */
export const useAuditStore = defineStore('audit.query', () => {
  // ─── state ──────────────────────────────────────────────────────────────
  const entries = ref<AuditEntry[]>([])
  const loading = ref(false)
  const errorKey = ref<string | null>(null)
  const nextCursor = ref('')
  const hasMore = ref(false)

  /** Free-text filter: matches against eventType + actorId + subjectId. */
  const filter = ref('')
  /** Actor kind filter: 'all' | 'human' | 'service' | 'cell' | 'sandbox' | 'unknown'. */
  const actorKind = ref('all')
  /** Action namespace filter: 'all' | 'flag' | 'config' | 'role' | 'secret' | etc. */
  const actionNs = ref('all')

  // ─── getters ────────────────────────────────────────────────────────────

  const filteredEntries = computed<AuditEntry[]>(() => {
    const q = filter.value.trim().toLowerCase()
    const kind = actorKind.value
    const ns = actionNs.value

    return entries.value.filter((e) => {
      // Free-text match across eventType + actorId + subjectId
      if (q) {
        const hay = `${e.eventType} ${e.actorId} ${e.subjectId ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }

      // Actor kind filter (heuristic classification)
      if (kind !== 'all' && classifyActor(e.actorId) !== kind) return false

      // Action namespace filter: match by eventType prefix before the first dot
      if (ns !== 'all') {
        const entryNs = e.eventType.split('.')[0] ?? ''
        if (entryNs !== ns) return false
      }

      return true
    })
  })

  /** Entries grouped by local date. Derived from filteredEntries. */
  const entriesByDay = computed<DayGroup[]>(() => groupByDay(filteredEntries.value))

  /**
   * Hash-chain integrity status for the loaded window.
   * Returns 'unavailable' until the backend exposes hash/prevHash (BR-006).
   * The verifyChain algorithm is fully implemented — passing real data will
   * activate the ok/broken paths without any frontend change.
   */
  const chainStatus = computed<ChainResult>(() => {
    // Contract gap: hash/prevHash are not in HttpAuditListV1Response (BR-006).
    // Build ChainEntry objects safely: only include the property when the value
    // is a string, so exactOptionalPropertyTypes is satisfied.
    type ExtendedEntry = Record<string, unknown>
    const chainEntries = entries.value.map((e) => {
      const ext = e as ExtendedEntry
      const entry: { hash?: string; prevHash?: string } = {}
      if (typeof ext['hash'] === 'string') entry.hash = ext['hash']
      if (typeof ext['prevHash'] === 'string') entry.prevHash = ext['prevHash']
      return entry
    })
    return verifyChain(chainEntries)
  })

  // ─── read actions ───────────────────────────────────────────────────────

  /** Fetch the first page, replacing any current entries. */
  async function fetchList(): Promise<void> {
    loading.value = true
    errorKey.value = null
    try {
      const page = await listAudit({ limit: PAGE_SIZE })
      entries.value = page.data
      nextCursor.value = page.nextCursor
      hasMore.value = page.hasMore
    } catch (err: unknown) {
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
      const page = await listAudit({ cursor: nextCursor.value, limit: PAGE_SIZE })
      entries.value = [...entries.value, ...page.data]
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
    entries,
    loading,
    errorKey,
    nextCursor,
    hasMore,
    filter,
    actorKind,
    actionNs,
    // getters
    filteredEntries,
    entriesByDay,
    chainStatus,
    // read actions
    fetchList,
    loadMore,
  }
})
