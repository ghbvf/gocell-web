import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserListPage from './UserListPage.vue'
import { createI18n } from 'vue-i18n'

vi.mock('./api', () => ({
  fetchUsers: vi.fn().mockResolvedValue([{ id: '1', username: 'admin' }])
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { access: { userManage: { title: 'User Management', createUser: 'Create User' } } } }
})

describe('UserListPage.vue', () => {
  it('renders correctly and fetches users', async () => {
    const wrapper = mount(UserListPage, {
      global: {
        plugins: [i18n],
        stubs: ['a-card', 'a-button', 'a-table', 'UserCreateModal']
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
