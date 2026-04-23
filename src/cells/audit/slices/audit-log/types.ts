export interface AuditEntry {
  id: string
  eventId: string
  eventType: string
  actorId: string
  timestamp: string
  payload?: any
}

export interface AuditPageResult {
  data: AuditEntry[]
  nextCursor?: string
  hasMore: boolean
}

export interface FetchAuditParams {
  limit?: number
  cursor?: string
  eventType?: string
  actorId?: string
  from?: string
  to?: string
}
