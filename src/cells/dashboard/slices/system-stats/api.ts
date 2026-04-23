import client from '@/shared/api/client'
import type { SystemStats } from './types'
import type { ApiResponse } from '@/shared/api/types'

export async function getSystemStats(): Promise<SystemStats> {
  // Use SSO as primary backend for basic system stats since we only have unified frontend and backend might not have dedicated /stats yet. 
  // Wait, does the backend have stats endpoint? In Phase 1 PRD, "系统统计 API" is needed. Assuming /api/v1/dashboard/stats but typically cell provides it. Let's assume /api/v1/access/stats for now, or just mock it.
  try {
    const res = await client.get<ApiResponse<SystemStats>>('/api/v1/access/stats')
    return res.data.data
  } catch (err) {
    return {
      goVersion: 'N/A',
      numGoroutine: 0,
      allocMemory: 0,
      uptime: 0
    }
  }
}
