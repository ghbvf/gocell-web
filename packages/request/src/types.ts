import type { AxiosError } from 'axios'

export interface SetupAxiosOptions {
  baseURL?: string
  getToken: () => string | null
  onRefresh: () => Promise<string | null>
  onAuthFail: () => void
  /**
   * URL substring used to identify the refresh endpoint itself.
   * Requests whose URL contains this string are never retried on 401
   * to prevent recursive refresh loops.
   *
   * Default: '/sessions/refresh'
   */
  refreshPath?: string
}

export interface GoCellRequestError extends AxiosError {
  i18nKey?: string
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    __isRetry?: boolean
  }
}
