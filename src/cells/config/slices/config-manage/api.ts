import client from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { ConfigItem, SetConfigRequest, CreateConfigRequest } from './types'

export async function fetchConfigs(): Promise<ConfigItem[]> {
  const res = await client.get<ApiResponse<ConfigItem[]>>('/api/v1/config/')
  return res.data.data || []
}

export async function setConfig(key: string, req: SetConfigRequest): Promise<void> {
  await client.put(`/api/v1/config/${key}`, req)
}

export async function addConfig(req: CreateConfigRequest): Promise<void> {
  await client.post('/api/v1/config/', req)
}

export async function publishConfig(key: string): Promise<void> {
  await client.post(`/api/v1/config/${key}/publish`)
}

export async function getConfig(key: string): Promise<ConfigItem> {
  const res = await client.get<ApiResponse<ConfigItem>>(`/api/v1/config/${key}`)
  return res.data.data
}
