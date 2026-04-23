import client from '@/shared/api/client'
import type { ServiceHealth, ReadyzResponse } from './types'

export async function checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
  const health: ServiceHealth = {
    name: serviceName,
    live: false,
    ready: false,
    lastCheck: new Date()
  }

  try {
    const [liveRes, readyRes] = await Promise.all([
      client.get(`/${serviceName}/healthz`),
      client.get<ReadyzResponse>(`/${serviceName}/readyz?verbose`)
    ])
    
    if (liveRes.status === 200 && liveRes.data.status === 'healthy') {
      health.live = true
    }
    
    if (readyRes.status === 200 && readyRes.data.status === 'healthy') {
      health.ready = true
      health.details = readyRes.data
    } else if (readyRes.status === 503) {
      health.details = readyRes.data
    }
  } catch (error: any) {
    // If it's a 503 from backend, it means not ready but might still be live
    if (error.response?.status === 503 && error.response?.data?.status === 'error') {
      health.live = true // assuming healthz passed or we just say it responds
      health.details = error.response.data
    }
  }

  return health
}
