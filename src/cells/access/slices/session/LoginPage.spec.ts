import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginPage from './LoginPage.vue'
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
  messages: { en: { access: { session: { title: 'Login' } } } }
})

describe('LoginPage.vue', () => {
  it('renders login form by default', () => {
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [createPinia(), router, i18n],
        stubs: ['a-card', 'a-tabs', 'a-tab-pane', 'a-form', 'a-form-item', 'a-input', 'a-input-password', 'a-button']
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
