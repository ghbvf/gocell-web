<template>
  <a-card :title="service.name.toUpperCase()" style="margin-bottom: 16px">
    <template #extra>
      <a-badge :status="statusColor" :text="statusText" />
    </template>
    
    <div style="margin-bottom: 16px">
      <p>Last checked: {{ service.lastCheck?.toLocaleTimeString() || 'N/A' }}</p>
    </div>

    <a-collapse v-model:activeKey="activeKey" v-if="service.details" :ghost="true">
      <a-collapse-panel key="1" header="Cells Detail" v-if="service.details.cells && Object.keys(service.details.cells).length > 0">
        <div v-for="(status, id) in service.details.cells" :key="id" style="margin-bottom: 8px">
          <a-tag :color="status === 'healthy' ? 'success' : 'error'">{{ status }}</a-tag>
          <strong>{{ id }}</strong>
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="2" header="Dependencies" v-if="service.details.dependencies && Object.keys(service.details.dependencies).length > 0">
        <div v-for="(status, id) in service.details.dependencies" :key="id" style="margin-bottom: 8px">
          <a-tag :color="status === 'healthy' ? 'success' : 'error'">{{ status }}</a-tag>
          <strong>{{ id }}</strong>
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="3" header="Adapters" v-if="service.details.adapters && Object.keys(service.details.adapters).length > 0">
        <div v-for="(type, id) in service.details.adapters" :key="id" style="margin-bottom: 8px">
          <a-tag color="blue">{{ type }}</a-tag>
          <strong>{{ id }}</strong>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ServiceHealth } from './types'
import { useI18n } from 'vue-i18n'

const activeKey = ref<string[]>([])

const props = defineProps<{
  service: ServiceHealth
}>()

const { t } = useI18n()

const statusColor = computed(() => {
  if (props.service.ready) return 'success'
  if (props.service.live) return 'warning'
  return 'error'
})

const statusText = computed(() => {
  if (!props.service.live) return t('dashboard.health.offline')
  if (!props.service.ready) return t('dashboard.health.online') + ' (Not Ready)'
  return t('dashboard.health.online') + ' (Ready)'
})
</script>
