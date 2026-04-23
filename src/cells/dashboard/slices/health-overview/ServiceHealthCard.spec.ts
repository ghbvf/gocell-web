import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ServiceHealthCard from './ServiceHealthCard.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { dashboard: { health: { online: 'Online', offline: 'Offline' } } } }
})

describe('ServiceHealthCard.vue', () => {
  it('displays online when live is true', () => {
    const wrapper = mount(ServiceHealthCard, {
      props: {
        service: { name: 'sso', live: true, ready: true, lastCheck: new Date() }
      },
      global: { plugins: [i18n], stubs: ['a-card', 'a-badge', 'a-collapse', 'a-collapse-panel', 'a-tag'] }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays offline when live is false', () => {
    const wrapper = mount(ServiceHealthCard, {
      props: {
        service: { name: 'sso', live: false, ready: false, lastCheck: new Date() }
      },
      global: { plugins: [i18n], stubs: ['a-card', 'a-badge', 'a-collapse', 'a-collapse-panel', 'a-tag'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
