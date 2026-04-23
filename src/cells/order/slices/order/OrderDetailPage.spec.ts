import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderDetailPage from './OrderDetailPage.vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'

vi.mock('./api', () => ({
  getOrder: vi.fn().mockResolvedValue({ id: '1', item: 'Laptop', status: 'CREATED', createdAt: '2023' })
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { order: { detailTitle: 'Order Details' } } } })
const router = createRouter({ history: createWebHistory(), routes: [{ path: '/orders/:id', component: OrderDetailPage }] })

describe('OrderDetailPage.vue', () => {
  it('renders correctly', async () => {
    router.push('/orders/1')
    await router.isReady()
    const wrapper = mount(OrderDetailPage, {
      global: { plugins: [i18n, router], stubs: ['a-card', 'a-descriptions', 'a-descriptions-item', 'a-button'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
