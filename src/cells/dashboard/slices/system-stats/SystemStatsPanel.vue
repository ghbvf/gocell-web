<template>
  <a-card title="System Statistics" style="margin-top: 24px">
    <a-row>
      <a-col :span="6">
        <a-statistic title="Go Version" :value="stats.goVersion" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="Goroutines" :value="stats.numGoroutine" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="Allocated Memory" :value="formatMemory(stats.allocMemory)" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="Uptime (s)" :value="stats.uptime" />
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSystemStats } from './api'
import type { SystemStats } from './types'

const stats = ref<SystemStats>({
  goVersion: 'Loading...',
  numGoroutine: 0,
  allocMemory: 0,
  uptime: 0
})

const formatMemory = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(async () => {
  stats.value = await getSystemStats()
})
</script>
