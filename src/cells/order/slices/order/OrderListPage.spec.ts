import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderListPage from './OrderListPage.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  fetchOrders: vi.fn().mockResolvedValue({ data: [], nextCursor: '', hasMore: false })
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { order: { title: 'Order Management', createOrder: 'Create Order' } } } })

describe('OrderListPage.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(OrderListPage, {
      global: { plugins: [i18n], stubs: ['a-card', 'a-table', 'a-button', 'OrderCreateDrawer'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
