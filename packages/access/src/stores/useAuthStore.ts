import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http } from '@gocell/request'
import type { HttpAuthRefreshV1Response } from '@gocell/contracts'

/**
 * Session view-model (not a wire contract).
 * accessToken lives only in Pinia state — never written to
 * localStorage or sessionStorage (security iron rule §7.1).
 */
export interface AuthUser {
  id: string
}

/** Payload shape derived from the refresh response contract */
type SessionData = HttpAuthRefreshV1Response['data']

export const useAuthStore = defineStore('access.auth', () => {
  // ─── state (all in-memory, never persisted) ───────────────────────────────
  const user = ref<AuthUser | null>(null)
  const accessToken = ref<string | null>(null)
  // refreshToken is write-only from outside; only refresh() reads it internally
  const _refreshToken = ref<string | null>(null)
  const passwordResetRequired = ref(false)

  // ─── getters ──────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => accessToken.value !== null)

  // ─── actions ──────────────────────────────────────────────────────────────

  /** Write session from login or refresh response .data into state. */
  function setSession(payload: SessionData): void {
    user.value = { id: payload.userId }
    accessToken.value = payload.accessToken
    _refreshToken.value = payload.refreshToken
    passwordResetRequired.value = payload.passwordResetRequired
  }

  /** Clear all session state (called on logout or failed refresh). */
  function clearSession(): void {
    user.value = null
    accessToken.value = null
    _refreshToken.value = null
    passwordResetRequired.value = false
  }

  /**
   * Attempt to exchange the current refresh token for a new access token.
   *
   * Returns the new accessToken on success, null otherwise.
   * On network/server failure: clearSession() + return null.
   *
   * This function is the onRefresh callback for apps/web setupAxios (PR-06).
   * Do NOT call setupAxios here — that is the app assembly layer's job.
   */
  async function refresh(): Promise<string | null> {
    if (!_refreshToken.value) {
      return null
    }

    try {
      const res = await http.post<HttpAuthRefreshV1Response>(
        '/api/v1/access/sessions/refresh',
        { refreshToken: _refreshToken.value },
      )
      setSession(res.data.data)
      return res.data.data.accessToken
    } catch {
      clearSession()
      return null
    }
  }

  return {
    // state (expose as readonly refs via Pinia's reactive proxy)
    user,
    accessToken,
    passwordResetRequired,
    // getters
    isAuthenticated,
    // actions
    setSession,
    clearSession,
    refresh,
  }
})
