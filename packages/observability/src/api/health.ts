/**
 * health.ts — cell health API (BR-001 GET /api/v1/admin/health/cells).
 *
 * Backend endpoint not yet implemented; calls 404 until BR-001 is delivered.
 * Callers must degrade gracefully on failure.
 *
 * Local types — backend has no health-cells schema yet; once codegen derives
 * HttpAdminHealthCellsV1Response, delete these interfaces and import from
 * @gocell/contracts instead.
 */
import { http } from '@gocell/request'

/** Collection endpoint for cell health. */
export const HEALTH_CELLS_URL = '/api/v1/admin/health/cells'

export type CellHealthStatus = 'healthy' | 'degraded' | 'down' | 'starting' | 'stopping'
export type CellType = 'core' | 'edge' | 'support'
export type DurabilityMode = 'Durable' | 'Demo'

export interface SliceHealth {
  name: string
  status: CellHealthStatus
  lastErrorAt: string | null
  lastErrorMessage: string | null
}

export interface CellHealthEntry {
  name: string
  type: CellType
  status: CellHealthStatus
  durability: DurabilityMode
  version: string
  commit: string
  startedAt: string
  uptimeSeconds: number
  lastHealthCheckAt: string
  lastHealthCheckDurationMs: number
  sliceCount: number
  slices: SliceHealth[]
}

export interface HealthSummary {
  totalCells: number
  healthy: number
  degraded: number
  down: number
  lastCheckAt: string
}

export interface HealthCellsResponse {
  summary: HealthSummary
  cells: CellHealthEntry[]
}

/** GET /api/v1/admin/health/cells — full cell health snapshot. */
export async function fetchCellHealth(): Promise<HealthCellsResponse> {
  const res = await http.get<HealthCellsResponse>(HEALTH_CELLS_URL)
  return res.data
}
