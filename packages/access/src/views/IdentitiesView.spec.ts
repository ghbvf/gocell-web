import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import { useIdentitiesStore } from '../stores/useIdentitiesStore'
import type { Identity } from '../api/identities'
import IdentitiesView from './IdentitiesView.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

const mkUser = (over: Partial<Identity> = {}): Identity => ({
  id: 'u-1',
  username: 'alice',
  email: 'alice@corp.example',
  status: 'active',
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-02T00:00:00Z',
  ...over,
})

type State = {
  users?: ReturnType<typeof mkUser>[]
  loading?: boolean
  errorKey?: string | null
  hasMore?: boolean
}

function mountView(state: State = {}) {
  const wrapper = mount(IdentitiesView, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            'access.identities': {
              users: [],
              loading: false,
              errorKey: null,
              nextCursor: '',
              hasMore: false,
              filter: '',
              ...state,
            },
          },
        }),
      ],
    },
  })
  const store = useIdentitiesStore()
  return { wrapper, store }
}

const rows = (w: ReturnType<typeof mountView>['wrapper']) => w.findAll('tbody tr')

describe('IdentitiesView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches the list once on mount', () => {
    const { store } = mountView()
    expect(store.fetchList).toHaveBeenCalledTimes(1)
  })

  it('renders one table row per identity', () => {
    const { wrapper } = mountView({ users: [mkUser(), mkUser({ id: 'u-2', username: 'bob' })] })
    expect(rows(wrapper)).toHaveLength(2)
  })

  it('renders column headers with scope="col"', () => {
    const { wrapper } = mountView({ users: [mkUser()] })
    const headers = wrapper.findAll('thead th')
    expect(headers.length).toBeGreaterThanOrEqual(4)
    headers.forEach((h) => expect(h.attributes('scope')).toBe('col'))
  })

  it('exposes the createdAt cell as a semantic <time> with a machine-readable datetime', () => {
    const { wrapper } = mountView({ users: [mkUser({ createdAt: '2026-05-01T00:00:00Z' })] })
    expect(wrapper.find('tbody tr time').attributes('datetime')).toBe('2026-05-01T00:00:00Z')
  })

  it('associates the quick-filter input with a label and narrows visible rows', async () => {
    const { wrapper, store } = mountView({
      users: [mkUser({ id: 'u-1', username: 'alice' }), mkUser({ id: 'u-2', username: 'bob' })],
    })
    const input = wrapper.find('#identities-filter')
    expect(wrapper.find('label[for="identities-filter"]').exists()).toBe(true)
    expect(rows(wrapper)).toHaveLength(2)

    store.filter = 'bob'
    await nextTick()
    expect(rows(wrapper)).toHaveLength(1)
    expect(input.exists()).toBe(true)
  })

  it('shows a loading indicator (role=status) while loading with no rows yet', () => {
    const { wrapper } = mountView({ loading: true, users: [] })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('shows an empty message when there are no users and not loading', () => {
    const { wrapper } = mountView({ users: [], loading: false })
    expect(wrapper.find('.identities__empty').exists()).toBe(true)
  })

  it('surfaces the store error via role=alert with the i18n key', () => {
    const { wrapper } = mountView({ errorKey: 'errors.network' })
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('errors.network')
  })

  it('renders the data table with an accessible name', () => {
    const { wrapper } = mountView({ users: [mkUser()] })
    expect(wrapper.find('table').attributes('aria-label')).toBeTruthy()
  })

  it('renders a disabled "service accounts" tab that is not focusable', () => {
    const { wrapper } = mountView()
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(2)
    const disabled = tabs.find((t) => t.attributes('aria-disabled') === 'true')
    expect(disabled).toBeDefined()
    expect(disabled!.attributes('tabindex')).toBe('-1')
    // it must NOT use the HTML disabled attribute (which drops it from the a11y tree)
    expect(disabled!.attributes('disabled')).toBeUndefined()
  })

  it('marks the active users tab selected', () => {
    const { wrapper } = mountView()
    const selected = wrapper
      .findAll('[role="tab"]')
      .find((t) => t.attributes('aria-selected') === 'true')
    expect(selected).toBeDefined()
    expect(selected!.attributes('tabindex')).toBe('0')
  })

  it('wires the active tab to a labelled tabpanel', () => {
    const { wrapper } = mountView({ users: [mkUser()] })
    const tab = wrapper.get('#identities-tab-users')
    expect(tab.attributes('aria-controls')).toBe('identities-panel-users')
    const panel = wrapper.get('#identities-panel-users')
    expect(panel.attributes('role')).toBe('tabpanel')
    expect(panel.attributes('aria-labelledby')).toBe('identities-tab-users')
  })

  it('shows a load-more control only when more pages exist and calls loadMore', async () => {
    const { wrapper, store } = mountView({ users: [mkUser()], hasMore: true })
    const btn = wrapper.find('[data-action="load-more"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    await flushPromises()
    expect(store.loadMore).toHaveBeenCalledTimes(1)
  })

  it('hides the load-more control when there are no more pages', () => {
    const { wrapper } = mountView({ users: [mkUser()], hasMore: false })
    expect(wrapper.find('[data-action="load-more"]').exists()).toBe(false)
  })
})
