<template>
  <a-drawer
    :open="open"
    :title="$t('order.createOrder')"
    width="400"
    @close="handleClose"
  >
    <a-form :model="formState" layout="vertical" ref="formRef">
      <a-form-item
        label="Item"
        name="item"
        :rules="[{ required: true, message: 'Please input item!' }]"
      >
        <a-input v-model:value="formState.item" />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" :loading="loading" @click="handleSubmit" style="width: 100%">
          {{ $t('common.submit') }}
        </a-button>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { createOrder } from './api'
import type { CreateOrderRequest } from './types'

defineProps<{ open: boolean }>()
const emit = defineEmits(['update:open', 'success'])

const formRef = ref()
const loading = ref(false)
const formState = reactive<CreateOrderRequest>({
  item: ''
})

const handleClose = () => {
  emit('update:open', false)
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    await createOrder(formState)
    message.success('Order created successfully')
    emit('success')
    emit('update:open', false)
    formState.item = ''
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Failed to create order')
  } finally {
    loading.value = false
  }
}
</script>
