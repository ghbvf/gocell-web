import { describe, it, expect, vi } from 'vitest'
import { fetchOrders, createOrder, getOrder } from './api'
import client from '@/shared/api/client'

vi.mock('@/shared/api/client', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    }
  }
})

describe('Order API', () => {
  it('calls GET /api/v1/orders/', async () => {
    // @ts-ignore
    client.get.mockResolvedValueOnce({ data: { data: [{ id: '1', item: 'test-item' }], hasMore: false, nextCursor: '' } })
    const res = await fetchOrders()
    expect(client.get).toHaveBeenCalledWith('/api/v1/orders/', { params: {} })
    expect(res.data).toHaveLength(1)
    expect(res.data[0].item).toBe('test-item')
  })

  it('calls POST /api/v1/orders/', async () => {
    // @ts-ignore
    client.post.mockResolvedValueOnce({ data: { data: { id: 'new-id' } } })
    const res = await createOrder({ item: 'new item' })
    expect(client.post).toHaveBeenCalledWith('/api/v1/orders/', { item: 'new item' })
    expect(res.id).toBe('new-id')
  })

  it('calls GET /api/v1/orders/:id', async () => {
    // @ts-ignore
    client.get.mockResolvedValueOnce({ data: { data: { id: '1', item: 'fetched item' } } })
    const order = await getOrder('1')
    expect(client.get).toHaveBeenCalledWith('/api/v1/orders/1')
    expect(order.item).toBe('fetched item')
  })
})
