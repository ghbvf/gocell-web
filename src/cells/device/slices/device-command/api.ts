import client from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { Command, SendCommandRequest } from './types'

export async function fetchCommands(deviceId: string): Promise<Command[]> {
  const res = await client.get<ApiResponse<Command[]>>(`/api/v1/devices/${deviceId}/commands`)
  return res.data.data || []
}

export async function sendCommand(deviceId: string, req: SendCommandRequest): Promise<{ id: string }> {
  const res = await client.post<ApiResponse<{ id: string }>>(`/api/v1/devices/${deviceId}/commands`, req)
  return res.data.data
}

export async function ackCommand(deviceId: string, cmdId: string): Promise<void> {
  await client.post(`/api/v1/devices/${deviceId}/commands/${cmdId}/ack`)
}
