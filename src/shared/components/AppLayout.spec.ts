import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppLayout from './AppLayout.vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
})

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { common: { home: 'Home', language: 'Language', logout: 'Logout' } } }
})

describe('AppLayout.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(AppLayout, {
      global: {
        plugins: [createPinia(), router, i18n],
        stubs: ['router-view', 'router-link', 'a-layout', 'a-layout-sider', 'a-layout-header', 'a-layout-content', 'a-menu', 'a-menu-item', 'a-dropdown', 'a-button']
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
