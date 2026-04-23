import client from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { Device, DeviceStatus, RegisterDeviceRequest } from './types'

export async function fetchDevices(): Promise<Device[]> {
  const res = await client.get<ApiResponse<Device[]>>('/api/v1/devices')
  return res.data.data || []
}

export async function registerDevice(req: RegisterDeviceRequest): Promise<{ id: string }> {
  const res = await client.post<ApiResponse<{ id: string }>>('/api/v1/devices', req)
  return res.data.data
}

export async function getDeviceStatus(id: string): Promise<DeviceStatus> {
  const res = await client.get<ApiResponse<DeviceStatus>>(`/api/v1/devices/${id}/status`)
  return res.data.data
}
