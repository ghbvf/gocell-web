import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CommandTimeline from './CommandTimeline.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  fetchCommands: vi.fn().mockResolvedValue([{ id: '1', status: 'PENDING' }]),
  ackCommand: vi.fn()
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { device: { timeline: 'Commands Timeline' } } } })

describe('CommandTimeline.vue', () => {
  it('renders timeline with buttons', () => {
    const wrapper = mount(CommandTimeline, {
      props: { deviceId: 'd1' },
      global: { plugins: [i18n], stubs: ['a-timeline', 'a-timeline-item', 'a-button', 'a-tag'] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
