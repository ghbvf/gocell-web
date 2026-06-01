import { describe, it, expect, vi } from 'vitest'
import { computed } from 'vue'
import { mount } from '@vue/test-utils'
import { PDP_INJECTION_KEY } from '@gocell/core'
import type { PdpClient } from '@gocell/core'
import type { HttpAuthRoleListV1Response } from '@gocell/contracts'
import RoleAssignmentForm from './RoleAssignmentForm.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

type Role = HttpAuthRoleListV1Response['data'][number]

const roles: Role[] = [
  { id: 'r-admin', name: 'Admin', permissions: [] },
  { id: 'r-viewer', name: 'Viewer', permissions: [] },
]

function makePdpClient(allowed: boolean): PdpClient {
  return {
    can: () => computed(() => allowed),
  }
}

/**
 * Mount RoleAssignmentForm directly.
 * PDP is provided via global.provide so the <Can> child component can inject it.
 *
 * When noProvider=true, no PDP key is provided — simulates fail-closed.
 */
function mountForm(
  props: { roles?: Role[]; busy?: boolean } = {},
  pdpAllowed: boolean = true,
  noProvider: boolean = false,
) {
  const resolvedProps = { roles, busy: false, ...props }

  const globalConfig = noProvider
    ? {}
    : { provide: { [PDP_INJECTION_KEY as symbol]: makePdpClient(pdpAllowed) } }

  return mount(RoleAssignmentForm, {
    props: resolvedProps,
    global: globalConfig,
  })
}

describe('RoleAssignmentForm', () => {
  describe('assign section', () => {
    it('emits assign with the trimmed roleId when Assign button is clicked', async () => {
      const w = mountForm()
      const input = w.find('[data-testid="assign-input"]')
      await input.setValue('  role-new  ')
      const btn = w.find('[data-testid="assign-btn"]')
      await btn.trigger('click')
      const emitted = w.emitted('assign')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual(['role-new'])
    })

    it('clears the input after successful assign emit', async () => {
      const w = mountForm()
      const input = w.find('[data-testid="assign-input"]')
      await input.setValue('role-new')
      await w.find('[data-testid="assign-btn"]').trigger('click')
      expect((input.element as HTMLInputElement).value).toBe('')
    })

    it('does NOT emit assign when input is blank', async () => {
      const w = mountForm()
      const input = w.find('[data-testid="assign-input"]')
      await input.setValue('   ')
      await w.find('[data-testid="assign-btn"]').trigger('click')
      const emitted = w.emitted('assign')
      expect(emitted).toBeFalsy()
    })

    it('emits assign on form submit (Enter key)', async () => {
      const w = mountForm()
      const input = w.find('[data-testid="assign-input"]')
      await input.setValue('role-enter')
      await w.find('[data-testid="assign-form"]').trigger('submit')
      const emitted = w.emitted('assign')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual(['role-enter'])
    })
  })

  describe('revoke section', () => {
    it('emits revoke with the selected roleId when Revoke button is clicked', async () => {
      const w = mountForm()
      const select = w.find('[data-testid="revoke-select"]')
      await select.setValue('r-viewer')
      const btn = w.find('[data-testid="revoke-btn"]')
      await btn.trigger('click')
      const emitted = w.emitted('revoke')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual(['r-viewer'])
    })

    it('renders options from the roles prop', () => {
      const w = mountForm()
      const options = w.findAll('[data-testid="revoke-select"] option')
      // Options include a placeholder option (value="") + 2 role options
      const roleOptions = options.filter((o) => o.attributes('value') !== '')
      expect(roleOptions).toHaveLength(2)
    })

    it('disables the revoke select and shows hint when roles is empty', () => {
      const w = mountForm({ roles: [] })
      const select = w.find('[data-testid="revoke-select"]')
      expect(select.attributes('disabled')).toBeDefined()
      const hint = w.find('[data-testid="revoke-empty-hint"]')
      expect(hint.exists()).toBe(true)
      expect(hint.text()).toBe('access.policies.revoke.empty')
    })
  })

  describe('busy state', () => {
    it('disables the assign input when busy', () => {
      const w = mountForm({ busy: true })
      const input = w.find('[data-testid="assign-input"]')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('disables the assign button when busy', () => {
      const w = mountForm({ busy: true })
      const btn = w.find('[data-testid="assign-btn"]')
      expect(btn.attributes('disabled')).toBeDefined()
    })

    it('disables the revoke select when busy', () => {
      const w = mountForm({ busy: true })
      const select = w.find('[data-testid="revoke-select"]')
      expect(select.attributes('disabled')).toBeDefined()
    })

    it('disables the revoke button when busy', () => {
      const w = mountForm({ busy: true })
      const btn = w.find('[data-testid="revoke-btn"]')
      expect(btn.attributes('disabled')).toBeDefined()
    })
  })

  describe('fail-closed: PDP denies or no provider', () => {
    it('does NOT render assign button when PDP denies', () => {
      const w = mountForm({}, false)
      const btn = w.find('[data-testid="assign-btn"]')
      expect(btn.exists()).toBe(false)
    })

    it('does NOT render revoke button when PDP denies', () => {
      const w = mountForm({}, false)
      const btn = w.find('[data-testid="revoke-btn"]')
      expect(btn.exists()).toBe(false)
    })

    it('does NOT render assign button when no provider', () => {
      const w = mountForm({}, true, true)
      const btn = w.find('[data-testid="assign-btn"]')
      expect(btn.exists()).toBe(false)
    })

    it('does NOT render revoke button when no provider', () => {
      const w = mountForm({}, true, true)
      const btn = w.find('[data-testid="revoke-btn"]')
      expect(btn.exists()).toBe(false)
    })
  })

  describe('a11y', () => {
    it('associates the assign label with the assign input via for/id', () => {
      const w = mountForm()
      const input = w.find('[data-testid="assign-input"]')
      const inputId = input.attributes('id')
      expect(inputId).toBeTruthy()
      const label = w.find(`label[for="${inputId}"]`)
      expect(label.exists()).toBe(true)
    })

    it('associates the revoke label with the revoke select via for/id', () => {
      const w = mountForm()
      const select = w.find('[data-testid="revoke-select"]')
      const selectId = select.attributes('id')
      expect(selectId).toBeTruthy()
      const label = w.find(`label[for="${selectId}"]`)
      expect(label.exists()).toBe(true)
    })
  })
})
