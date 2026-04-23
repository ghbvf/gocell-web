<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2>{{ $t('order.detailTitle') }}</h2>
      <a-button @click="$router.back()">Back</a-button>
    </div>

    <a-card :loading="loading">
      <a-descriptions v-if="order" bordered>
        <a-descriptions-item label="Order ID">{{ order.id }}</a-descriptions-item>
        <a-descriptions-item label="Item">{{ order.item }}</a-descriptions-item>
        <a-descriptions-item label="Status">{{ order.status }}</a-descriptions-item>
        <a-descriptions-item label="Created At">{{ order.createdAt }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getOrder } from './api'
import type { Order } from './types'

const route = useRoute()
const order = ref<Order | null>(null)
const loading = ref(false)

const loadDetail = async () => {
  const id = route.params.id as string
  if (!id) return
  loading.value = true
  try {
    order.value = await getOrder(id)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>
