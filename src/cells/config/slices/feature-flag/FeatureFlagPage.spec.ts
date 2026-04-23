import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FeatureFlagPage from './FeatureFlagPage.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  fetchFlags: vi.fn().mockResolvedValue([]),
  toggleFlag: vi.fn()
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { config: { flagTitle: 'Feature Flags' } } } })

describe('FeatureFlagPage.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(FeatureFlagPage, {
      global: { plugins: [i18n], stubs: ['a-card', 'a-list', 'a-list-item', 'a-switch', 'a-list-item-meta'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
