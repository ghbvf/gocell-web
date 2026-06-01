import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toI18nKey } from '@gocell/request'
import { listUserRoles, assignRole, revokeRole, type Role } from '../api/roles'

/**
 * access.policies — per-user role-binding state (Batch 3 RBAC slice).
 *
 * Owns the role list for a selected user, plus assign / revoke mutations
 * that back the RBAC assignment panel.
 *
 * Read actions (fetchRoles) swallow errors into `errorKey` so the panel
 * can display an inline error without crashing. Mutation actions (assign /
 * revoke) DO NOT swallow — they re-throw so the triggering control can show
 * an inline error and stay open; on success they re-fetch the user's roles.
 */
export const usePoliciesStore = defineStore('access.policies', () => {
  // ─── state ──────────────────────────────────────────────────────────────
  const userId = ref('')
  const roles = ref<Role[]>([])
  const loading = ref(false)
  const errorKey = ref<string | null>(null)

  // ─── read actions ───────────────────────────────────────────────────────

  /**
   * Fetch roles assigned to `id`. If id is blank, clears the role list and
   * returns immediately without making a network request.
   */
  async function fetchRoles(id: string): Promise<void> {
    if (!id.trim()) {
      roles.value = []
      return
    }
    userId.value = id
    loading.value = true
    errorKey.value = null
    try {
      roles.value = await listUserRoles(id)
    } catch (err: unknown) {
      // Keep prior roles on failure; surface the i18n key for inline display.
      errorKey.value = toI18nKey(err)
    } finally {
      loading.value = false
    }
  }

  // ─── mutation actions (re-throw on failure; refresh on success) ──────────

  /**
   * Assign `roleId` to the current `userId`. Refreshes the role list on
   * success. Re-throws on failure — the calling UI is responsible for
   * surfacing the error inline and keeping the panel open.
   */
  async function assign(roleId: string): Promise<void> {
    await assignRole({ userId: userId.value, roleId })
    await fetchRoles(userId.value)
  }

  /**
   * Revoke `roleId` from the current `userId`. Symmetric with `assign`:
   * refreshes on success, re-throws on failure.
   */
  async function revoke(roleId: string): Promise<void> {
    await revokeRole({ userId: userId.value, roleId })
    await fetchRoles(userId.value)
  }

  return {
    // state
    userId,
    roles,
    loading,
    errorKey,
    // read actions
    fetchRoles,
    // mutation actions
    assign,
    revoke,
  }
})
