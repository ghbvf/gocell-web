import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AccessComingSoonView from './AccessComingSoonView.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

function mountView(titleKey: string) {
  return mount(AccessComingSoonView, {
    props: { titleKey },
  })
}

describe('AccessComingSoonView', () => {
  it('renders the h1 with the resolved titleKey', () => {
    const wrapper = mountView('nav.decisions')
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('nav.decisions')
  })

  it('renders the coming-soon badge', () => {
    const wrapper = mountView('nav.decisions')
    expect(wrapper.text()).toContain('access.comingSoon.badge')
  })

  it('renders the body text in role=status', () => {
    const wrapper = mountView('nav.decisions')
    const status = wrapper.find('[role="status"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toContain('access.comingSoon.body')
  })

  it('uses the provided titleKey as the h1 text', () => {
    const wrapper = mountView('nav.reviews')
    expect(wrapper.find('h1').text()).toBe('nav.reviews')
  })
})
