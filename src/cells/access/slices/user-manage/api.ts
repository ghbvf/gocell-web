import client from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { User, CreateUserRequest, PatchUserRequest } from './types'

export async function fetchUsers(): Promise<User[]> {
  const res = await client.get<ApiResponse<User[]>>('/api/v1/access/users')
  return res.data.data
}

export async function createUser(req: CreateUserRequest): Promise<{ id: string }> {
  const res = await client.post<ApiResponse<{ id: string }>>('/api/v1/access/users', req)
  return res.data.data
}

export async function deleteUser(id: string): Promise<void> {
  await client.delete(`/api/v1/access/users/${id}`)
}

export async function lockUser(id: string): Promise<void> {
  await client.post(`/api/v1/access/users/${id}/lock`)
}

export async function unlockUser(id: string): Promise<void> {
  await client.post(`/api/v1/access/users/${id}/unlock`)
}

export async function getUser(id: string): Promise<User> {
  const res = await client.get<ApiResponse<User>>(`/api/v1/access/users/${id}`)
  return res.data.data
}

export async function patchUser(id: string, req: PatchUserRequest): Promise<User> {
  const res = await client.patch<ApiResponse<User>>(`/api/v1/access/users/${id}`, req)
  return res.data.data
}
