import type { AxiosError } from 'axios'

export interface SetupAxiosOptions {
  baseURL?: string
  getToken: () => string | null
  onRefresh: () => Promise<string | null>
  onAuthFail: () => void
}

export interface GoCellRequestError extends AxiosError {
  i18nKey?: string
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    __isRetry?: boolean
  }
}
