<template>
  <div>
    <h2>{{ $t('config.title') }}</h2>
    <a-card>
      <template #extra>
        <a-button type="primary" @click="createConfig">{{ $t('config.createConfig') }}</a-button>
      </template>
      <a-table :dataSource="configs" :columns="columns" rowKey="key" :loading="loading">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="editConfig(record)">Edit</a-button>
            <a-popconfirm
              title="Are you sure you want to publish this configuration?"
              @confirm="handlePublish(record)"
            >
              <a-button type="link" style="color: #52c41a">Publish</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <ConfigEditModal
      v-model:open="modalOpen"
      :isCreate="isCreateMode"
      :configKey="editingKey"
      :initialValue="editingValue"
      @success="loadConfigs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { fetchConfigs, publishConfig } from './api'
import type { ConfigItem } from './types'
import ConfigEditModal from './ConfigEditModal.vue'

const configs = ref<ConfigItem[]>([])
const loading = ref(false)

const modalOpen = ref(false)
const isCreateMode = ref(false)
const editingKey = ref('')
const editingValue = ref('')

const columns = [
  { title: 'Key', dataIndex: 'key', key: 'key' },
  { title: 'Value', dataIndex: 'value', key: 'value', ellipsis: true },
  { title: 'Version', dataIndex: 'version', key: 'version' },
  { title: 'Action', key: 'action' }
]

const loadConfigs = async () => {
  loading.value = true
  try {
    configs.value = await fetchConfigs()
  } finally {
    loading.value = false
  }
}

const createConfig = () => {
  isCreateMode.value = true
  editingKey.value = ''
  editingValue.value = ''
  modalOpen.value = true
}

const editConfig = (record: ConfigItem) => {
  isCreateMode.value = false
  editingKey.value = record.key
  editingValue.value = record.value
  modalOpen.value = true
}

const handlePublish = async (record: ConfigItem) => {
  try {
    await publishConfig(record.key)
    message.success(`Configuration ${record.key} published successfully`)
    loadConfigs()
  } catch (err: any) {
    message.error(`Failed to publish ${record.key}`)
  }
}

onMounted(() => {
  loadConfigs()
})
</script>
