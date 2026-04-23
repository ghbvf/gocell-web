import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfigListPage from './ConfigListPage.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  fetchConfigs: vi.fn().mockResolvedValue([])
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { config: { title: 'Configuration Management' } } } })

describe('ConfigListPage.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(ConfigListPage, {
      global: { plugins: [i18n], stubs: ['a-card', 'a-table', 'a-button', 'ConfigEditModal'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
