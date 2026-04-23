import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderCreateDrawer from './OrderCreateDrawer.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  createOrder: vi.fn().mockResolvedValue({ id: '123' })
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { order: { createOrder: 'Create Order', item: 'Item' } } } })

describe('OrderCreateDrawer.vue', () => {
  it('renders drawer form', () => {
    const wrapper = mount(OrderCreateDrawer, {
      props: { open: true },
      global: { plugins: [i18n], stubs: ['a-drawer', 'a-form', 'a-form-item', 'a-input', 'a-button'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
