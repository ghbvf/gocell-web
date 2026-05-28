import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { toI18nKey } from './errors'
import type { SetupAxiosOptions, GoCellRequestError } from './types'

function attachI18nKey(error: unknown): void {
  // Cast through unknown first to satisfy strict TS — we are intentionally
  // adding a property to an AxiosError at the boundary.
  const e = error as unknown as GoCellRequestError
  e.i18nKey = toI18nKey(error)
}

export const http: AxiosInstance = axios.create({
  baseURL: '/api',
})

// Track installed interceptor IDs so setupAxios is idempotent.
let requestInterceptorId: number | null = null
let responseInterceptorId: number | null = null

// Refresh single-flight state
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null
type QueueEntry = {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}
let waitQueue: QueueEntry[] = []

function flushQueue(token: string): void {
  for (const entry of waitQueue) {
    entry.resolve(token)
  }
  waitQueue = []
}

function rejectQueue(err: unknown): void {
  for (const entry of waitQueue) {
    entry.reject(err)
  }
  waitQueue = []
}

/**
 * Exposed only for testing — resets interceptors and refresh state so each
 * test starts clean.  Not exported from index.ts.
 */
export function _resetForTesting(): void {
  if (requestInterceptorId !== null) {
    http.interceptors.request.eject(requestInterceptorId)
    requestInterceptorId = null
  }
  if (responseInterceptorId !== null) {
    http.interceptors.response.eject(responseInterceptorId)
    responseInterceptorId = null
  }
  isRefreshing = false
  refreshPromise = null
  waitQueue = []
}

const REFRESH_PATH = '/auth/refresh/v1'

/**
 * Installs request + response interceptors on the shared `http` instance.
 * Idempotent: calling it more than once is a no-op (previous interceptors are
 * ejected first if already installed).
 */
export function setupAxios(opts: SetupAxiosOptions): void {
  // Eject previous interceptors to guarantee exactly one set is active.
  if (requestInterceptorId !== null) {
    http.interceptors.request.eject(requestInterceptorId)
  }
  if (responseInterceptorId !== null) {
    http.interceptors.response.eject(responseInterceptorId)
  }

  // Also reset baseURL if provided
  if (opts.baseURL !== undefined) {
    http.defaults.baseURL = opts.baseURL
  }

  // ── Request interceptor: inject Bearer token ─────────────────────────────
  requestInterceptorId = http.interceptors.request.use((config) => {
    const token = opts.getToken()
    if (token !== null) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  })

  // ── Response interceptor: 401 single-flight refresh ──────────────────────
  responseInterceptorId = http.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      // Narrow to AxiosError
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error)
      }

      const config = error.config as (AxiosRequestConfig & { __isRetry?: boolean }) | undefined

      // Non-401 or already a retry or missing config → attach i18nKey and reject
      const status = error.response?.status
      if (
        status !== 401 ||
        config === undefined ||
        config.__isRetry === true
      ) {
        attachI18nKey(error)
        return Promise.reject(error)
      }

      // Detect refresh endpoint itself — avoid recursive refresh
      const url = config.url ?? ''
      const isRefreshEndpoint = url.includes(REFRESH_PATH)
      if (isRefreshEndpoint) {
        attachI18nKey(error)
        return Promise.reject(error)
      }

      // First 401: start refresh; subsequent 401s: queue and wait
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = opts
          .onRefresh()
          .then((newToken) => {
            isRefreshing = false
            refreshPromise = null
            if (newToken === null) {
              rejectQueue(error)
              opts.onAuthFail()
              return null
            }
            flushQueue(newToken)
            return newToken
          })
          .catch((refreshErr: unknown) => {
            isRefreshing = false
            refreshPromise = null
            rejectQueue(refreshErr)
            opts.onAuthFail()
            return null
          })
      }

      // Wait for the in-flight refresh
      const newToken = await new Promise<string | null>((resolve, reject) => {
        if (!isRefreshing && refreshPromise === null) {
          // Refresh already completed (resolved or rejected) before we queued.
          // This shouldn't normally happen but guard defensively.
          resolve(null)
        } else {
          waitQueue.push({
            resolve: (tok) => resolve(tok),
            reject: (err) => reject(err),
          })
        }
      }).catch((_err: unknown) => null)

      // refreshPromise may have resolved without going through the queue
      // (first caller path) — read the result directly for the initial caller.
      const resolvedToken = newToken ?? (await refreshPromise)

      if (resolvedToken === null) {
        attachI18nKey(error)
        return Promise.reject(error)
      }

      // Replay original request with new token
      const retryConfig: AxiosRequestConfig & { __isRetry?: boolean } = {
        ...config,
        __isRetry: true,
        headers: {
          ...(config.headers as Record<string, string> | undefined),
          Authorization: `Bearer ${resolvedToken}`,
        },
      }
      return http(retryConfig)
    },
  )
}
