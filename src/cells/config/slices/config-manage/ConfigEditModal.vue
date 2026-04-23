<template>
  <a-modal
    :open="open"
    :title="isCreate ? $t('config.createConfig') : $t('config.editConfig')"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form layout="vertical">
      <a-form-item label="Key">
        <a-input v-model:value="formKey" :disabled="!isCreate" placeholder="e.g. site.title" />
      </a-form-item>
      <a-form-item label="Value">
        <a-input v-model:value="formValue" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { setConfig, addConfig } from './api'

const props = defineProps<{
  open: boolean
  isCreate: boolean
  configKey: string
  initialValue: string
}>()

const emit = defineEmits(['update:open', 'success'])

const loading = ref(false)
const formKey = ref(props.configKey)
const formValue = ref(props.initialValue)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    formKey.value = props.configKey
    formValue.value = props.initialValue
  }
})

const handleOk = async () => {
  if (!formValue.value || (props.isCreate && !formKey.value)) {
    message.warning('Key and Value are required')
    return
  }
  loading.value = true
  try {
    if (props.isCreate) {
      await addConfig({ key: formKey.value, value: formValue.value })
      message.success('Configuration created successfully')
    } else {
      await setConfig(props.configKey, { value: formValue.value })
      message.success('Configuration updated successfully')
    }
    emit('success')
    emit('update:open', false)
  } catch (err: any) {
    message.error(props.isCreate ? 'Failed to create config' : 'Failed to update config')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('update:open', false)
}
</script>
