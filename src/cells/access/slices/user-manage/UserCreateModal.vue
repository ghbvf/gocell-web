<template>
  <a-modal
    :open="open"
    :title="$t('access.userManage.createUser')"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :model="formState" layout="vertical" ref="formRef">
      <a-form-item
        :label="$t('access.session.username')"
        name="username"
        :rules="[{ required: true, message: 'Please input username!' }]"
      >
        <a-input v-model:value="formState.username" />
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
      <a-form-item
        label="Password"
        name="password"
        :rules="[{ required: true, message: 'Please input password!' }]"
      >
        <a-input-password v-model:value="formState.password" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { createUser } from './api'
import type { CreateUserRequest } from './types'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits(['update:open', 'success'])

const formRef = ref()
const loading = ref(false)
const formState = reactive<CreateUserRequest>({
  username: '',
  email: '',
  password: ''
})

const handleOk = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    await createUser(formState)
    message.success('User created successfully')
    emit('success')
    emit('update:open', false)
    formState.username = ''
    formState.email = ''
    formState.password = ''
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
  formState.username = ''
  formState.email = ''
  formState.password = ''
}
</script>
