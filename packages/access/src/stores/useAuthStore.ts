import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http } from '@gocell/request'
import type {
  HttpAuthLoginV1Request,
  HttpAuthLoginV1Response,
  HttpAuthRefreshV1Response,
} from '@gocell/contracts'

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

const LOGIN_URL = '/api/v1/access/sessions/login'
const REFRESH_URL = '/api/v1/access/sessions/refresh'
/** DELETE /sessions/{id} — logout revokes the current session server-side. */
const SESSION_URL = '/api/v1/access/sessions/'

export const useAuthStore = defineStore('access.auth', () => {
  // ─── state (all in-memory, never persisted) ───────────────────────────────
  const user = ref<AuthUser | null>(null)
  const accessToken = ref<string | null>(null)
  // refreshToken is write-only from outside; only refresh() reads it internally
  const _refreshToken = ref<string | null>(null)
  // sessionId is internal; only logout() reads it to revoke the session server-side
  const _sessionId = ref<string | null>(null)
  const passwordResetRequired = ref(false)

  // ─── getters ──────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => accessToken.value !== null)

  // ─── actions ──────────────────────────────────────────────────────────────

  /** Write session from login or refresh response .data into state. */
  function setSession(payload: SessionData): void {
    user.value = { id: payload.userId }
    accessToken.value = payload.accessToken
    _refreshToken.value = payload.refreshToken
    _sessionId.value = payload.sessionId
    passwordResetRequired.value = payload.passwordResetRequired
  }

  /** Clear all session state (called on logout or failed refresh). */
  function clearSession(): void {
    user.value = null
    accessToken.value = null
    _refreshToken.value = null
    _sessionId.value = null
    passwordResetRequired.value = false
  }

  /**
   * Exchange username + password for a token pair and persist the session.
   *
   * Carries __skipAuthRefresh so a 401 (bad credentials) surfaces inline at the
   * login form instead of triggering the refresh interceptor's bounce to
   * /login (see @gocell/request). On failure the error propagates (with its
   * i18nKey attached by the interceptor) for the caller to display; the store
   * is left untouched. Navigation is the view's responsibility, not the store's.
   */
  async function login(credentials: HttpAuthLoginV1Request): Promise<void> {
    const res = await http.post<HttpAuthLoginV1Response>(LOGIN_URL, credentials, {
      __skipAuthRefresh: true,
    })
    setSession(res.data.data)
  }

  /**
   * Revoke the current session server-side then clear local state.
   *
   * Best-effort: a failed DELETE (network / already-expired) must not block the
   * local sign-out, so the session is always cleared in `finally`. Navigation
   * to /login is the caller's responsibility.
   */
  async function logout(): Promise<void> {
    const sid = _sessionId.value
    try {
      if (sid) {
        await http.delete(`${SESSION_URL}${sid}`)
      }
    } catch {
      // Swallowed by design — local sign-out proceeds regardless.
    } finally {
      clearSession()
    }
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
      const res = await http.post<HttpAuthRefreshV1Response>(REFRESH_URL, {
        refreshToken: _refreshToken.value,
      })
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
    login,
    logout,
    refresh,
  }
})
