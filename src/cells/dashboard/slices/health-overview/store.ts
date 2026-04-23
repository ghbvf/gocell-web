import { defineStore } from 'pinia'
import { ref } from 'vue'
import { checkServiceHealth } from './api'
import type { ServiceHealth } from './types'

export const useHealthStore = defineStore('dashboard-health', () => {
  const services = ref<ServiceHealth[]>([
    { name: 'sso', live: false, ready: false },
    { name: 'order', live: false, ready: false },
    { name: 'device', live: false, ready: false },
  ])

  const loading = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  async function fetchHealth() {
    loading.value = true
    try {
      const results = await Promise.all([
        checkServiceHealth('sso'),
        checkServiceHealth('order'),
        checkServiceHealth('device')
      ])
      services.value = results
    } finally {
      loading.value = false
    }
  }

  function startPolling(intervalMs = 10000) {
    if (pollTimer) return
    fetchHealth()
    pollTimer = setInterval(fetchHealth, intervalMs)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return { services, loading, fetchHealth, startPolling, stopPolling }
})
