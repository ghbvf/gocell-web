import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CommandSendModal from './CommandSendModal.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  sendCommand: vi.fn().mockResolvedValue({ id: '1' })
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { device: { sendCommand: 'Send Command', payload: 'Payload' } } } })

describe('CommandSendModal.vue', () => {
  it('renders modal form', () => {
    const wrapper = mount(CommandSendModal, {
      props: { open: true, deviceId: 'd1' },
      global: { plugins: [i18n], stubs: ['a-modal', 'a-form', 'a-form-item', 'a-input'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
