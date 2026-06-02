import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import ConfigurationTab from './ConfigurationTab.vue'
import type { CellEntry } from '../../manifest/types'

vi.mock('../../api/cellConfig', () => ({
  fetchCellConfig: vi.fn(),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('vue-router', () => ({
  RouterLink: defineComponent({
    props: { to: String },
    setup(props, { slots }) {
      return () => h('a', { href: String(props.to) }, slots.default?.())
    },
  }),
}))

import { fetchCellConfig } from '../../api/cellConfig'

const mockFetch = vi.mocked(fetchCellConfig)

const cell: CellEntry = {
  id: 'configcore',
  name: 'ConfigCore',
  domain: 'Config',
  type: 'core',
  consistencyLevel: 'L1',
  lifecycle: 'stable',
  durabilityMode: 'durable',
  owner: { team: 'platform', role: 'owner' },
  goStructName: 'ConfigCore',
  schemaPrimary: null,
  requires: [],
  l0Dependencies: [],
  smokeTests: [],
  slices: [],
  produces: [],
  consumes: [],
  dependsOnCells: [],
  requiredByCells: [],
}

const sampleEntries = [
  {
    id: 'cfg-001',
    key: 'max_retries',
    value: '3',
    sensitive: false,
    version: 2,
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'cfg-002',
    key: 'db_password',
    value: '******',
    sensitive: true,
    version: 1,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
]

describe('ConfigurationTab', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('shows loading state before the fetch resolves', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(ConfigurationTab, { props: { cell } })
    expect(wrapper.find('[role="status"]').text()).toBe('cells.configuration.loading')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('renders a table with entries after successful fetch', async () => {
    mockFetch.mockResolvedValue({
      data: sampleEntries,
      nextCursor: 'cur-3',
      hasMore: false,
    })
    const wrapper = mount(ConfigurationTab, { props: { cell } })
    await flushPromises()

    expect(wrapper.find('table').exists()).toBe(true)
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0]?.text()).toContain('max_retries')
    expect(rows[0]?.text()).toContain('3')
    expect(rows[1]?.text()).toContain('db_password')
    expect(rows[1]?.text()).toContain('******')
  })

  it('renders column headers from i18n keys', async () => {
    mockFetch.mockResolvedValue({
      data: sampleEntries,
      nextCursor: '',
      hasMore: false,
    })
    const wrapper = mount(ConfigurationTab, { props: { cell } })
    await flushPromises()

    const headers = wrapper.findAll('th')
    expect(headers[0]?.text()).toBe('cells.configuration.key')
    expect(headers[1]?.text()).toBe('cells.configuration.value')
    expect(headers[2]?.text()).toBe('cells.configuration.version')
  })

  it('shows empty state when data array is empty', async () => {
    mockFetch.mockResolvedValue({ data: [], nextCursor: '', hasMore: false })
    const wrapper = mount(ConfigurationTab, { props: { cell } })
    await flushPromises()

    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.text()).toContain('cells.configuration.empty')
  })

  it('shows error state when fetch rejects', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))
    const wrapper = mount(ConfigurationTab, { props: { cell } })
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('cells.configuration.error')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('renders open-full link in data state', async () => {
    mockFetch.mockResolvedValue({
      data: sampleEntries,
      nextCursor: '',
      hasMore: false,
    })
    const wrapper = mount(ConfigurationTab, { props: { cell } })
    await flushPromises()

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('cells.configuration.openFull')
  })

  it('calls fetchCellConfig with limit: 50', async () => {
    mockFetch.mockResolvedValue({ data: [], nextCursor: '', hasMore: false })
    mount(ConfigurationTab, { props: { cell } })
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith({ limit: 50 })
  })
})
