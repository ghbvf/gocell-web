import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceCommandPage from './DeviceCommandPage.vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { device: { commandControl: 'Command Control', statusTitle: 'Status' } } } })
const router = createRouter({ history: createWebHistory(), routes: [{ path: '/devices/:id/commands', component: DeviceCommandPage }] })

describe('DeviceCommandPage.vue', () => {
  it('renders correctly', async () => {
    router.push('/devices/d1/commands')
    await router.isReady()
    const wrapper = mount(DeviceCommandPage, {
      global: { plugins: [i18n, router], stubs: ['a-card', 'a-row', 'a-col', 'a-button', 'CommandSendModal', 'CommandTimeline', 'DeviceStatusCard'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
