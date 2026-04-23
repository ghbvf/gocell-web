<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2>{{ $t('order.title') }}</h2>
      <a-button type="primary" @click="drawerOpen = true">
        {{ $t('order.createOrder') }}
      </a-button>
    </div>

    <a-card>
      <a-table :dataSource="orders" :columns="columns" rowKey="id" :loading="loading" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="$router.push(`/orders/${record.id}`)">Details</a-button>
          </template>
        </template>
      </a-table>
      <div v-if="hasMore" style="text-align: center; margin-top: 16px;">
        <a-button @click="loadMore" :loading="loading">Load More</a-button>
      </div>
    </a-card>

    <OrderCreateDrawer v-model:open="drawerOpen" @success="loadOrders(true)" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchOrders } from './api'
import type { Order } from './types'
import OrderCreateDrawer from './OrderCreateDrawer.vue'

const orders = ref<Order[]>([])
const loading = ref(false)
const drawerOpen = ref(false)

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Item', dataIndex: 'item', key: 'item' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
  { title: 'Action', key: 'action' }
]

const cursor = ref<string>('')
const hasMore = ref<boolean>(false)

const loadOrders = async (reset = false) => {
  loading.value = true
  if (reset) {
    cursor.value = ''
    orders.value = []
  }
  try {
    const res = await fetchOrders(10, cursor.value)
    if (reset) {
      orders.value = res.data
    } else {
      orders.value.push(...res.data)
    }
    hasMore.value = res.hasMore
    cursor.value = res.nextCursor || ''
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (hasMore.value && !loading.value) {
    loadOrders(false)
  }
}

onMounted(() => {
  loadOrders(true)
})
</script>
