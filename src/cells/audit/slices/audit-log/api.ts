import client from '@/shared/api/client'
import type { AuditPageResult, FetchAuditParams } from './types'

export async function fetchAuditLogs(params: FetchAuditParams = {}): Promise<AuditPageResult> {
  const query: Record<string, any> = {}
  if (params.limit) query.limit = params.limit
  if (params.cursor) query.cursor = params.cursor
  if (params.eventType) query.eventType = params.eventType
  if (params.actorId) query.actorId = params.actorId
  if (params.from) query.from = params.from
  if (params.to) query.to = params.to

  const res = await client.get<AuditPageResult>('/api/v1/audit/entries', { params: query })
  return res.data
}
