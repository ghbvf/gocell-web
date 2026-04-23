<template>
  <a-modal
    :open="open"
    :title="$t('device.register')"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :model="formState" layout="vertical" ref="formRef">
      <a-form-item
        :label="$t('device.name')"
        name="name"
        :rules="[{ required: true, message: 'Please input device name!' }]"
      >
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <a-form-item
        :label="$t('device.macAddress')"
        name="macAddress"
        :rules="[{ required: true, message: 'Please input MAC address!' }]"
      >
        <a-input v-model:value="formState.macAddress" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { registerDevice } from './api'
import type { RegisterDeviceRequest } from './types'

defineProps<{ open: boolean }>()
const emit = defineEmits(['update:open', 'success'])

const formRef = ref()
const loading = ref(false)
const formState = reactive<RegisterDeviceRequest>({
  name: '',
  macAddress: ''
})

const handleOk = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    await registerDevice(formState)
    message.success('Device registered successfully')
    emit('success')
    emit('update:open', false)
    formState.name = ''
    formState.macAddress = ''
  } catch (err: any) {
    message.error(err.response?.data?.message || 'Failed to register device')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('update:open', false)
  formState.name = ''
  formState.macAddress = ''
}
</script>
