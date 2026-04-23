export interface Order {
  id: string
  item: string
  status: string
  createdAt: string
}

export interface CreateOrderRequest {
  item: string
}

export interface OrderPageResult {
  data: Order[]
  nextCursor?: string
  hasMore: boolean
}
