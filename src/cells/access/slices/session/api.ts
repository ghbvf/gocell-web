import client from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { LoginRequest, LoginResponse, RegisterRequest } from './types'

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await client.post<ApiResponse<LoginResponse>>('/api/v1/access/sessions/login', req)
  return res.data.data
}

export async function register(req: RegisterRequest): Promise<void> {
  await client.post('/api/v1/access/users', req)
}

export async function logout(sessionId: string): Promise<void> {
  await client.delete(`/api/v1/access/sessions/${sessionId}`)
}

export async function refresh(): Promise<LoginResponse> {
  const res = await client.post<ApiResponse<LoginResponse>>('/api/v1/access/sessions/refresh')
  return res.data.data
}
