import client from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { Order, CreateOrderRequest, OrderPageResult } from './types'

export async function fetchOrders(limit?: number, cursor?: string): Promise<OrderPageResult> {
  const params: Record<string, any> = {}
  if (limit) params.limit = limit
  if (cursor) params.cursor = cursor
  
  const res = await client.get<OrderPageResult>('/api/v1/orders/', { params })
  return res.data
}

export async function createOrder(req: CreateOrderRequest): Promise<{ id: string }> {
  const res = await client.post<ApiResponse<{ id: string }>>('/api/v1/orders/', req)
  return res.data.data
}

export async function getOrder(id: string): Promise<Order> {
  const res = await client.get<ApiResponse<Order>>(`/api/v1/orders/${id}`)
  return res.data.data
}
