export interface HealthCellStatus {
  id: string
  status: 'SERVING' | 'NOT_SERVING' | 'UNKNOWN'
}

export interface ReadyzResponse {
  status: string // e.g. "healthy"
  cells?: Record<string, string>
  dependencies?: Record<string, string>
  adapters?: Record<string, string>
}

export interface ServiceHealth {
  name: string
  live: boolean
  ready: boolean
  lastCheck?: Date
  details?: ReadyzResponse
}
