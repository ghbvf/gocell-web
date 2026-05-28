import type { AxiosError } from 'axios'
import type { GoCellHTTPErrorResponse } from '@gocell/contracts'

function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as Record<string, unknown>)['isAxiosError'] === true
  )
}

function isGoCellErrorEnvelope(data: unknown): data is GoCellHTTPErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as Record<string, unknown>)['error'] === 'object' &&
    (data as Record<string, unknown>)['error'] !== null &&
    typeof ((data as GoCellHTTPErrorResponse).error).code === 'string'
  )
}

export function toI18nKey(err: unknown): string {
  if (!isAxiosError(err)) {
    return 'errors.unknown'
  }

  // Network error: no response object
  if (!err.response) {
    return 'errors.network'
  }

  const data: unknown = err.response.data
  if (isGoCellErrorEnvelope(data)) {
    const safeCode = data.error.code.replace(/[^A-Z0-9_]/g, '_')
    return `errors.${safeCode}`
  }

  return 'errors.unknown'
}
