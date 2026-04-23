import client from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { FeatureFlag } from './types'

export async function fetchFlags(): Promise<FeatureFlag[]> {
  const res = await client.get<ApiResponse<FeatureFlag[]>>('/api/v1/flags')
  return res.data.data || []
}
