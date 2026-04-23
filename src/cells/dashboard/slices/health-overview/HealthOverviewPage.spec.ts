import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HealthOverviewPage from './HealthOverviewPage.vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { dashboard: { health: { title: 'Health Status' } } } }
})

describe('HealthOverviewPage.vue', () => {
  it('renders the title', () => {
    const wrapper = mount(HealthOverviewPage, {
      global: {
        plugins: [createPinia(), i18n],
        stubs: ['a-row', 'a-col', 'ServiceHealthCard']
      }
    })
    expect(wrapper.html()).toContain('Health Status')
  })
})
