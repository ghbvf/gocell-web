<template>
  <a-modal
    :open="open"
    :title="$t('device.sendCommand')"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :model="formState" layout="vertical" ref="formRef">
      <a-form-item
        :label="$t('device.payload')"
        name="payload"
        :rules="[{ required: true, message: 'Please input payload!' }]"
      >
        <a-input v-model:value="formState.payload" placeholder='{"action": "on"}' />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { sendCommand } from './api'
import type { SendCommandRequest } from './types'

const props = defineProps<{ open: boolean, deviceId: string }>()
const emit = defineEmits(['update:open', 'success'])

const formRef = ref()
const loading = ref(false)
const formState = reactive<SendCommandRequest>({ payload: '' })

const handleOk = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    await sendCommand(props.deviceId, formState)
    message.success('Command sent successfully')
    emit('success')
    emit('update:open', false)
    formState.payload = ''
  } catch (err: any) {
    message.error(err.response?.data?.message || 'Failed to send command')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('update:open', false)
  formState.payload = ''
}
</script>
