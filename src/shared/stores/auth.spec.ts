import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty token and user', () => {
    const auth = useAuthStore()
    expect(auth.token).toBe('')
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })

  it('can set token and user', () => {
    const auth = useAuthStore()
    auth.setToken('test-token')
    auth.setUser({ id: '1', username: 'admin' })
    
    expect(auth.token).toBe('test-token')
    expect(auth.user).toEqual({ id: '1', username: 'admin' })
    expect(auth.isAuthenticated).toBe(true)
  })

  it('can logout and clear state', () => {
    const auth = useAuthStore()
    auth.setToken('test-token')
    auth.setUser({ id: '1', username: 'admin' })
    
    auth.logout()
    
    expect(auth.token).toBe('')
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })
})
