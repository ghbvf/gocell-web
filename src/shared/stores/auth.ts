import { defineStore } from 'pinia'

export interface User {
  id: string
  username: string
  [key: string]: any
}

interface AuthState {
  token: string
  user: User | null
}

export const useAuthStore = defineStore('shared-auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('gocell-token') || '',
    user: localStorage.getItem('gocell-user') ? JSON.parse(localStorage.getItem('gocell-user') as string) : null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('gocell-token', token)
    },
    setUser(user: User) {
      this.user = user
      localStorage.setItem('gocell-user', JSON.stringify(user))
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('gocell-token')
      localStorage.removeItem('gocell-user')
    }
  }
})
