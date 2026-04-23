import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceRegisterModal from './DeviceRegisterModal.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  registerDevice: vi.fn().mockResolvedValue({ id: '123' })
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { device: { register: 'Register Device', name: 'Device Name', macAddress: 'MAC Address' } } } })

describe('DeviceRegisterModal.vue', () => {
  it('renders modal form', () => {
    const wrapper = mount(DeviceRegisterModal, {
      props: { open: true },
      global: { plugins: [i18n], stubs: ['a-modal', 'a-form', 'a-form-item', 'a-input'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
