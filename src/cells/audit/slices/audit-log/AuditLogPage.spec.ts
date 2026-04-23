import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AuditLogPage from './AuditLogPage.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  fetchAuditLogs: vi.fn().mockResolvedValue({ data: [], hasMore: false, nextCursor: '' })
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { audit: { auditLog: { title: 'Audit Logs' } } } } })

describe('AuditLogPage.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(AuditLogPage, {
      global: { plugins: [i18n], stubs: ['a-card', 'a-table', 'a-button', 'a-form', 'a-form-item', 'a-input'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
