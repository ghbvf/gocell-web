<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2>{{ $t('device.title', '设备管理') }}</h2>
      <a-button type="primary" @click="modalOpen = true">
        {{ $t('device.register', '注册新设备') }}
      </a-button>
    </div>

    <a-alert
      message="API Degradation Notice"
      description="后端未提供全局设备列表查询接口 (GET /api/v1/devices)。此处降级为按已知 Device ID 精确查找。"
      type="warning"
      show-icon
      style="margin-bottom: 16px;"
    />

    <a-card title="快速定位设备 (Quick Locate)">
      <a-input-search
        v-model:value="searchId"
        placeholder="输入设备 ID (Device ID)"
        enter-button="进入命令控制台"
        size="large"
        @search="goToDeviceConsole"
      />
    </a-card>

    <a-card title="本地注册历史 (Local Registration History)" style="margin-top: 24px;" v-if="localHistory.length > 0">
      <a-table :dataSource="localHistory" :columns="columns" rowKey="id" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="$router.push(`/devices/${record.id}/commands`)">Commands</a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <DeviceRegisterModal v-model:open="modalOpen" @success="handleRegisterSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DeviceRegisterModal from './DeviceRegisterModal.vue'

const router = useRouter()
const searchId = ref('')
const modalOpen = ref(false)

const localHistory = ref<any[]>([])

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'MAC Address', dataIndex: 'macAddress', key: 'macAddress' },
  { title: 'Action', key: 'action' }
]

const goToDeviceConsole = (value: string) => {
  if (value.trim()) {
    router.push(`/devices/${value.trim()}/commands`)
  }
}

const handleRegisterSuccess = (device: any) => {
  localHistory.value.push({
    id: device.id,
    name: device.name || 'N/A',
    macAddress: device.macAddress || 'N/A'
  })
}
</script>
