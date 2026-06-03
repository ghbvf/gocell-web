/**
 * system.ts — system info API (BR-002 GET /api/v1/admin/system).
 *
 * Backend endpoint not yet implemented; calls 404 until BR-002 is delivered.
 * Callers must degrade gracefully on failure.
 *
 * Local types — backend has no system schema yet; once codegen derives
 * HttpAdminSystemV1Response, delete these interfaces and import from
 * @gocell/contracts instead.
 */
import { http } from '@gocell/request'

/** System info endpoint. */
export const SYSTEM_URL = '/api/v1/admin/system'

export interface BuildInfo {
  version: string
  commit: string
  commitDate: string
  buildDate: string
  goVersion: string
  tags: string[]
  dirty: boolean
}

export interface RuntimeInfo {
  uptimeSeconds: number
  goroutines: number
  memoryMB: number
  memoryAllocBytes: number
  gcPauseTotalNs: number
  cpuPercent: number
  pid: number
}

export interface AssemblyInfo {
  name: string
  cells: string[]
  primaryAddr: string
  internalAddr: string
}

export interface EnvironmentInfo {
  env: string
  hostname: string
  containerized: boolean
}

export interface SystemInfoResponse {
  build: BuildInfo
  runtime: RuntimeInfo
  assembly: AssemblyInfo
  environment: EnvironmentInfo
}

/** GET /api/v1/admin/system — runtime system snapshot. */
export async function fetchSystemInfo(): Promise<SystemInfoResponse> {
  const res = await http.get<SystemInfoResponse>(SYSTEM_URL)
  return res.data
}
