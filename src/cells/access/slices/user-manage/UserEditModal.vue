<template>
  <a-modal
    :open="open"
    :title="$t('access.userManage.editUser', { id: userId })"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :model="formState" layout="vertical" ref="formRef">
      <a-form-item
        :label="$t('access.session.username')"
        name="name"
        :rules="[{ required: true, message: 'Please input username!' }]"
      >
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <a-form-item
        label="Email"
        name="email"
        :rules="[
          { required: true, message: 'Please input email!' },
          { type: 'email', message: 'Please input a valid email!' }
        ]"
      >
        <a-input v-model:value="formState.email" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { patchUser, getUser } from './api'
import type { PatchUserRequest } from './types'

const props = defineProps<{
  open: boolean
  userId: string | null
}>()

const emit = defineEmits(['update:open', 'success'])

const formRef = ref()
const loading = ref(false)
const formState = reactive<PatchUserRequest>({
  name: '',
  email: ''
})

watch(() => props.open, async (newVal) => {
  if (newVal && props.userId) {
    loading.value = true
    try {
      const user = await getUser(props.userId)
      formState.name = user.username
      formState.email = user.email
    } catch (e: any) {
      message.error('Failed to load user details')
      emit('update:open', false)
    } finally {
      loading.value = false
    }
  }
})

const handleOk = async () => {
  if (!props.userId) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    await patchUser(props.userId, formState)
    message.success('User updated successfully')
    emit('success')
    emit('update:open', false)
  } catch (error: any) {
    if (error.response?.data?.message) {
      message.error(error.response.data.message)
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('update:open', false)
}
</script>
