<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2>{{ $t('dashboard.health.title') }}</h2>
      <a-button type="primary" :loading="healthStore.loading" @click="refresh">
        Refresh
      </a-button>
    </div>

    <a-row :gutter="16">
      <a-col :span="8" v-for="service in healthStore.services" :key="service.name">
        <ServiceHealthCard :service="service" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useHealthStore } from './store'
import ServiceHealthCard from './ServiceHealthCard.vue'

const healthStore = useHealthStore()

const refresh = () => {
  healthStore.fetchHealth()
}

onMounted(() => {
  healthStore.startPolling(10000) // 10s poll as per PRD
})

onUnmounted(() => {
  healthStore.stopPolling()
})
</script>
