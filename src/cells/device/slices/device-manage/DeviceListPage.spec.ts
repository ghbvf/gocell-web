import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceListPage from './DeviceListPage.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  fetchDevices: vi.fn().mockResolvedValue([])
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { device: { title: 'IoT Devices', register: 'Register Device' } } } })

describe('DeviceListPage.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(DeviceListPage, {
      global: { plugins: [i18n], stubs: ['a-card', 'a-table', 'a-button', 'a-badge', 'DeviceRegisterModal'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
