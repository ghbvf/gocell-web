import { describe, it, expect } from 'vitest'
import { fetchRoles } from './api'

describe('RBAC API', () => {
  it('returns mock roles', async () => {
    const roles = await fetchRoles()
    expect(roles).toHaveLength(2)
  })
})
