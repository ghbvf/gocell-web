<template>
  <div class="login-container">
    <a-card style="width: 400px; margin: 100px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1)">
      <a-alert
        message="Development Environment Notice"
        description="由于后端运行在测试 In-Memory 模式，请前往终端控制台查看 [sso-bff] 启动日志中的 'seed admin ready' 以获取自动生成的 admin 账号密码。"
        type="info"
        show-icon
        style="margin-bottom: 16px;"
      />
      <a-tabs v-model:activeKey="activeTab" centered>
        <!-- Login Tab -->
        <a-tab-pane key="login" :tab="$t('access.session.title')">
          <a-form :model="loginState" layout="vertical" @finish="handleLogin">
            <a-form-item :label="$t('access.session.username')" name="username" :rules="[{ required: true }]">
              <a-input v-model:value="loginState.username" />
            </a-form-item>
            <a-form-item :label="$t('access.session.password')" name="password">
              <a-input-password v-model:value="loginState.password" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" block :loading="loading">
                {{ $t('access.session.submit') }}
              </a-button>
            </a-form-item>
            <div style="text-align: center">
              <a @click="activeTab = 'register'">{{ $t('access.session.noAccount') }}</a>
            </div>
          </a-form>
        </a-tab-pane>

        <!-- Register Tab -->
        <a-tab-pane key="register" :tab="$t('access.session.registerTitle')">
          <a-form :model="registerState" layout="vertical" @finish="handleRegister">
            <a-form-item :label="$t('access.session.username')" name="username" :rules="[{ required: true }]">
              <a-input v-model:value="registerState.username" />
            </a-form-item>
            <a-form-item label="Email" name="email" :rules="[{ required: true, type: 'email' }]">
              <a-input v-model:value="registerState.email" />
            </a-form-item>
            <a-form-item :label="$t('access.session.password')" name="password" :rules="[{ required: true }]">
              <a-input-password v-model:value="registerState.password" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" block :loading="loading">
                {{ $t('access.session.registerSubmit') }}
              </a-button>
            </a-form-item>
            <div style="text-align: center">
              <a @click="activeTab = 'login'">{{ $t('access.session.hasAccount') }}</a>
            </div>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/shared/stores/auth'
import { login, register } from './api'
import type { LoginRequest, RegisterRequest } from './types'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const loading = ref(false)

const loginState = reactive<LoginRequest>({
  username: '',
  password: ''
})

const registerState = reactive<RegisterRequest>({
  username: '',
  email: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await login({ username: loginState.username, password: loginState.password })
    authStore.setToken(res.accessToken)
    authStore.setUser({ id: 'unknown', username: loginState.username })
    message.success('Login successful')
    router.push('/')
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Login failed')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  loading.value = true
  try {
    await register({ 
      username: registerState.username, 
      email: registerState.email, 
      password: registerState.password 
    })
    message.success('Registration successful, please login')
    activeTab.value = 'login'
    loginState.username = registerState.username
    if (registerState.password) {
      loginState.password = registerState.password
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color, #f0f2f5);
}
</style>
