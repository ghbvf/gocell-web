<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo">GoCell</div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" @click="handleMenuClick">
        <a-menu-item key="/">
          <template #icon>
            <DashboardOutlined />
          </template>
          <span>{{ $t('common.home') }}</span>
        </a-menu-item>
        
        <a-sub-menu key="access">
          <template #title>SSO (Access)</template>
          <a-menu-item key="/access/users">{{ $t('access.userManage.title') }}</a-menu-item>
          <a-menu-item key="/access/rbac">{{ $t('access.rbac.title') }}</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="audit">
          <template #title>Audit</template>
          <a-menu-item key="/audit/logs">{{ $t('audit.auditLog.title') }}</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="order">
          <template #title>Order Subsystem</template>
          <a-menu-item key="/orders">{{ $t('order.title') }}</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="device">
          <template #title>IoT Subsystem</template>
          <a-menu-item key="/devices">{{ $t('device.title') }}</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="config">
          <template #title>Config</template>
          <a-menu-item key="/config/entries">{{ $t('config.title') }}</a-menu-item>
          <a-menu-item key="/config/flags">{{ $t('config.flagTitle') }}</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="devtools">
          <template #title>Devtools</template>
          <a-menu-item key="/devtools/topology">{{ $t('devtools.topology') }}</a-menu-item>
          <a-menu-item key="/devtools/contracts">{{ $t('devtools.contracts') }}</a-menu-item>
          <a-menu-item key="/devtools/journeys">{{ $t('devtools.journeys') }}</a-menu-item>
          <a-menu-item key="/devtools/governance">{{ $t('devtools.governance') }}</a-menu-item>
          <a-menu-item key="/devtools/consistency">{{ $t('devtools.consistency') }}</a-menu-item>
          <a-menu-item key="/devtools/event-flow">{{ $t('devtools.eventFlow') }}</a-menu-item>
          <a-menu-item key="/devtools/outbox">{{ $t('devtools.outbox') }}</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0 16px; display: flex; justify-content: flex-end; align-items: center;">
        <div style="display: flex; gap: 16px;">
          <!-- Language Switcher -->
          <a-dropdown>
            <a class="ant-dropdown-link" @click.prevent>
              {{ $t('common.language') }}
            </a>
            <template #overlay>
              <a-menu @click="changeLanguage">
                <a-menu-item key="zh-CN">中文</a-menu-item>
                <a-menu-item key="en-US">English</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          
          <!-- Logout -->
          <a-button type="link" @click="doLogout">
            {{ $t('common.logout') }}
          </a-button>
        </div>
      </a-layout-header>
      
      <a-layout-content style="margin: 16px; background: #fff; padding: 24px; min-height: 280px">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import { DashboardOutlined } from '@ant-design/icons-vue'

const collapsed = ref<boolean>(false)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { locale } = useI18n()

const selectedKeys = ref<string[]>([route.path])

const handleMenuClick = (e: { key: string }) => {
  router.push(e.key)
}

const changeLanguage = (e: { key: string }) => {
  locale.value = e.key
  localStorage.setItem('gocell-lang', e.key)
}

const doLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>
