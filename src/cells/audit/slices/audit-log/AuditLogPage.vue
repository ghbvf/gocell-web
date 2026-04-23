<template>
  <div>
    <div style="margin-bottom: 24px;">
      <h2>{{ $t('audit.auditLog.title') }}</h2>
    </div>

    <a-card style="margin-bottom: 24px;">
      <a-form layout="inline" @finish="handleSearch">
        <a-form-item label="Actor ID">
          <a-input v-model:value="filters.actorId" placeholder="Search by Actor ID" allowClear />
        </a-form-item>
        <a-form-item label="Event Type">
          <a-input v-model:value="filters.eventType" placeholder="Filter by event type" allowClear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading">Search</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card>
      <a-table 
        :dataSource="logs" 
        :columns="columns" 
        rowKey="id" 
        :loading="loading"
        :pagination="false"
      >
        <template #expandedRowRender="{ record }">
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 4px;">
            <pre style="margin: 0; white-space: pre-wrap;">{{ JSON.stringify(record.payload, null, 2) }}</pre>
          </div>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'timestamp'">
            {{ new Date(record.timestamp).toLocaleString() }}
          </template>
        </template>
      </a-table>

      <div v-if="hasMore" style="text-align: center; margin-top: 16px;">
        <a-button @click="loadMore" :loading="loading">Load More</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { fetchAuditLogs } from './api'
import type { AuditEntry, FetchAuditParams } from './types'

const logs = ref<AuditEntry[]>([])
const loading = ref(false)
const hasMore = ref(false)
const cursor = ref('')

const filters = reactive({
  actorId: '',
  eventType: ''
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Event Type', dataIndex: 'eventType', key: 'eventType' },
  { title: 'Actor ID', dataIndex: 'actorId', key: 'actorId' },
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' }
]

const loadData = async (reset = false) => {
  loading.value = true
  if (reset) {
    cursor.value = ''
    logs.value = []
  }

  const params: FetchAuditParams = {
    limit: 10,
    cursor: cursor.value
  }

  if (filters.actorId) params.actorId = filters.actorId
  if (filters.eventType) params.eventType = filters.eventType

  try {
    const res = await fetchAuditLogs(params)
    if (reset) {
      logs.value = res.data
    } else {
      logs.value.push(...res.data)
    }
    hasMore.value = res.hasMore
    cursor.value = res.nextCursor || ''
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadData(true)
}

const loadMore = () => {
  if (hasMore.value && !loading.value) {
    loadData(false)
  }
}

onMounted(() => {
  loadData(true)
})
</script>
