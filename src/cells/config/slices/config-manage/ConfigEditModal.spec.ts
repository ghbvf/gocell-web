import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfigEditModal from './ConfigEditModal.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  setConfig: vi.fn().mockResolvedValue({})
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { config: { editConfig: 'Edit Config' } } } })

describe('ConfigEditModal.vue', () => {
  it('renders correctly when open', () => {
    const wrapper = mount(ConfigEditModal, {
      props: { open: true, isCreate: false, configKey: 'test_key', initialValue: 'test_val' },
      global: { plugins: [i18n], stubs: ['a-modal', 'a-form', 'a-form-item', 'a-input'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
