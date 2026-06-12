import { describe, it, expect } from 'vitest'
import { ADMIN_GRANT, VIEWER_GRANT, evaluateGrant, createMockDecide } from './mockDecide'

describe('mockDecide — deterministic RBAC mock decision source', () => {
  describe('evaluateGrant', () => {
    it('ADMIN_GRANT (*:*) allows any action on any resource', () => {
      expect(evaluateGrant(ADMIN_GRANT, { action: 'read', resource: 'identity' })).toEqual({
        effect: 'allow',
        reasonCode: '',
      })
      expect(evaluateGrant(ADMIN_GRANT, { action: 'delete', resource: 'config' })).toEqual({
        effect: 'allow',
        reasonCode: '',
      })
    })

    it('ADMIN_GRANT allows an action with no resource', () => {
      expect(evaluateGrant(ADMIN_GRANT, { action: 'list' })).toEqual({
        effect: 'allow',
        reasonCode: '',
      })
    })

    it('VIEWER_GRANT (read:*) allows read on any resource', () => {
      expect(evaluateGrant(VIEWER_GRANT, { action: 'read', resource: 'audit' })).toEqual({
        effect: 'allow',
        reasonCode: '',
      })
    })

    it('VIEWER_GRANT denies write/delete with reasonCode role-missing', () => {
      expect(evaluateGrant(VIEWER_GRANT, { action: 'write', resource: 'config' })).toEqual({
        effect: 'deny',
        reasonCode: 'role-missing',
      })
      expect(evaluateGrant(VIEWER_GRANT, { action: 'delete', resource: 'identity' })).toEqual({
        effect: 'deny',
        reasonCode: 'role-missing',
      })
    })

    it('matches an exact action:resource rule', () => {
      const grant = ['write:config'] as const
      expect(evaluateGrant(grant, { action: 'write', resource: 'config' }).effect).toBe('allow')
      expect(evaluateGrant(grant, { action: 'write', resource: 'flag' }).effect).toBe('deny')
      expect(evaluateGrant(grant, { action: 'read', resource: 'config' }).effect).toBe('deny')
    })

    it('action wildcard matches any action on a fixed resource', () => {
      const grant = ['*:config'] as const
      expect(evaluateGrant(grant, { action: 'read', resource: 'config' }).effect).toBe('allow')
      expect(evaluateGrant(grant, { action: 'delete', resource: 'config' }).effect).toBe('allow')
      expect(evaluateGrant(grant, { action: 'read', resource: 'flag' }).effect).toBe('deny')
    })

    it('empty grant denies everything', () => {
      expect(evaluateGrant([], { action: 'read', resource: 'cell' })).toEqual({
        effect: 'deny',
        reasonCode: 'role-missing',
      })
    })

    it('ignores malformed rules without a colon (fail-closed)', () => {
      const grant = ['read'] as const // no ':' → never matches
      expect(evaluateGrant(grant, { action: 'read', resource: '' }).effect).toBe('deny')
    })

    it('a rule with an empty resource matches a request with no resource', () => {
      const grant = ['read:'] as const
      expect(evaluateGrant(grant, { action: 'read' }).effect).toBe('allow')
      expect(evaluateGrant(grant, { action: 'read', resource: 'cell' }).effect).toBe('deny')
    })
  })

  describe('createMockDecide', () => {
    it('defaults to the admin grant → allow', async () => {
      const decide = createMockDecide()
      expect(await decide({ action: 'delete', resource: 'config' })).toEqual({
        effect: 'allow',
        reasonCode: '',
      })
    })

    it('honors a custom grant → deny for ungranted actions', async () => {
      const decide = createMockDecide(VIEWER_GRANT)
      expect(await decide({ action: 'write', resource: 'flag' })).toEqual({
        effect: 'deny',
        reasonCode: 'role-missing',
      })
      expect((await decide({ action: 'read', resource: 'flag' })).effect).toBe('allow')
    })
  })
})
