import type { Role } from './types'

export async function fetchRoles(): Promise<Role[]> {
  // Placeholder mock API, wait for access-core authorization-decide backend
  return Promise.resolve([
    { id: '1', name: 'Admin', description: 'Super Administrator' },
    { id: '2', name: 'User', description: 'Regular User' }
  ])
}
