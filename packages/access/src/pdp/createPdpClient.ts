/**
 * BR-004 stub: /api/v1/access/decide is not yet delivered by the backend.
 * Until it is, this client is fully wired (cache + TTL + fail-closed) but
 * the endpoint will return 404 → fail-closed → all can() === false.
 * Real integration lands in PR-12 / T306 once BR-004 §4.1 is shipped.
 */
import { computed, reactive } from 'vue'
import type { ComputedRef } from 'vue'
import { http } from '@gocell/request'
import type { PdpClient } from '@gocell/core'

const TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  allowed: boolean
  fetchedAt: number
}

/**
 * Reactive cache: keyed by `action|resource`.
 * Using a plain reactive object (record) so Vue tracks property access
 * in computed() calls — reactive Map also works in Vue 3, but plain
 * object property access is more predictably tracked by the scheduler.
 */
interface Cache {
  entries: Record<string, CacheEntry>
}

function cacheKey(action: string, resource: string | undefined): string {
  return `${action}|${resource ?? ''}`
}

/**
 * Create a PdpClient implementation.
 *
 * Design:
 * - Reactive cache record keyed by `action|resource`.
 * - First access → fires async POST to /api/v1/access/decide; result written
 *   into reactive cache → all computed refs sharing the key update reactively.
 * - fail-closed: initial / in-flight / error → false; only explicit
 *   `data.allowed === true` flips the entry to true.
 * - TTL = 5 min; expired entries are deleted and re-fetched on next access.
 * - In-flight guard: single concurrent request per key (no double-fire).
 * - ComputedRef cache: same key always returns the same ComputedRef instance,
 *   preventing heap accumulation from repeated can() calls.
 */
export function createPdpClient(): PdpClient {
  const store = reactive<Cache>({ entries: {} })
  const inFlight = new Set<string>()
  // Cache of ComputedRef instances keyed by action|resource to avoid creating
  // new computed refs on every can() call.
  const computedCache = new Map<string, ComputedRef<boolean>>()

  function isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.fetchedAt > TTL_MS
  }

  async function fetchDecision(action: string, resource: string | undefined): Promise<void> {
    const key = cacheKey(action, resource)
    if (inFlight.has(key)) return
    inFlight.add(key)

    try {
      const res = await http.post<{ data: { allowed: boolean } }>(
        '/api/v1/access/decide',
        { action, resource },
      )
      // Only true when backend explicitly says so — fail-closed
      const allowed = res.data.data.allowed === true
      store.entries[key] = { allowed, fetchedAt: Date.now() }
    } catch {
      // Network error / 404 / any failure → fail-closed
      // Cache as false so repeated calls don't spam; TTL will expire it.
      store.entries[key] = { allowed: false, fetchedAt: Date.now() }
    } finally {
      inFlight.delete(key)
    }
  }

  function can(action: string, resource?: string): ComputedRef<boolean> {
    const key = cacheKey(action, resource)
    const cached = computedCache.get(key)
    if (cached) return cached

    const ref = computed(() => {
      const entry = store.entries[key]

      if (!entry || isExpired(entry)) {
        // Delete expired entry so the new fetch result wins cleanly.
        if (entry && isExpired(entry)) {
          delete store.entries[key]
        }
        // Fire side-effect; computed must be synchronous — no await.
        fetchDecision(action, resource)
        return false // fail-closed while pending
      }

      return entry.allowed
    })

    computedCache.set(key, ref)
    return ref
  }

  return { can }
}
