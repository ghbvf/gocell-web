import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import axios from 'axios'
import client from './client'
import { useAuthStore } from '../stores/auth'

describe('API Client', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('injects Authorization header if token exists', async () => {
    const auth = useAuthStore()
    auth.setToken('my-test-token')

    // Access the request interceptor
    // @ts-ignore
    const requestInterceptor = client.interceptors.request.handlers[0].fulfilled
    
    const config = { headers: new axios.AxiosHeaders() } as any
    const interceptedConfig = await requestInterceptor(config)
    
    expect(interceptedConfig.headers.Authorization).toBe('Bearer my-test-token')
  })

  it('does not inject Authorization header if no token', async () => {
    // Access the request interceptor
    // @ts-ignore
    const requestInterceptor = client.interceptors.request.handlers[0].fulfilled
    
    const config = { headers: new axios.AxiosHeaders() } as any
    const interceptedConfig = await requestInterceptor(config)
    
    expect(interceptedConfig.headers.Authorization).toBeUndefined()
  })

  it('rejects on response error', async () => {
    // @ts-ignore
    const responseErrorInterceptor = client.interceptors.response.handlers[0].rejected
    
    const error = { response: { status: 401 } }
    
    await expect(responseErrorInterceptor!(error)).rejects.toEqual(error)
  })
})
