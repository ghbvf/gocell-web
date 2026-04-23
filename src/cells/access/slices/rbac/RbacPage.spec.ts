import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RbacPage from './RbacPage.vue'

describe('RbacPage', () => {
  it('renders correctly', () => {
    const wrapper = mount(RbacPage, {
      global: {
        stubs: ['a-card', 'a-table', 'a-descriptions', 'a-descriptions-item']
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
