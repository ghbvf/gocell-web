<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2>{{ $t('access.userManage.title') }}</h2>
      <a-button type="primary" @click="modalOpen = true">
        {{ $t('access.userManage.createUser') }}
      </a-button>
    </div>

    <a-card>
      <a-table :dataSource="users" :columns="columns" rowKey="id" :loading="loading">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'locked' ? 'red' : 'green'">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space size="small">
              <a-button type="link" size="small" @click="handleEdit(record.id)">Edit</a-button>

              <a-popconfirm
                v-if="record.status === 'locked'"
                title="Are you sure to unlock this user?"
                @confirm="handleUnlock(record.id)"
              >
                <a-button type="link" size="small" style="color: #52c41a;">Unlock</a-button>
              </a-popconfirm>
              <a-popconfirm
                v-else
                title="Are you sure to lock this user?"
                @confirm="handleLock(record.id)"
              >
                <a-button type="link" danger size="small">Lock</a-button>
              </a-popconfirm>

              <a-popconfirm
                title="Are you sure to delete this user forever?"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" danger size="small">Delete</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <UserCreateModal v-model:open="modalOpen" @success="loadUsers" />
    <UserEditModal v-model:open="editModalOpen" :userId="editingUserId" @success="loadUsers" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { fetchUsers, lockUser, unlockUser, deleteUser } from './api'
import type { User } from './types'
import UserCreateModal from './UserCreateModal.vue'
import UserEditModal from './UserEditModal.vue'

const users = ref<User[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const editModalOpen = ref(false)
const editingUserId = ref<string | null>(null)

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Username', dataIndex: 'username', key: 'username' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
  { title: 'Actions', key: 'action' }
]

const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await fetchUsers()
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Failed to load users')
  } finally {
    loading.value = false
  }
}

const handleEdit = (id: string) => {
  editingUserId.value = id
  editModalOpen.value = true
}

const handleLock = async (id: string) => {
  try {
    await lockUser(id)
    message.success('User locked')
    loadUsers()
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Failed to lock user')
  }
}

const handleUnlock = async (id: string) => {
  try {
    await unlockUser(id)
    message.success('User unlocked')
    loadUsers()
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Failed to unlock user')
  }
}

const handleDelete = async (id: string) => {
  try {
    await deleteUser(id)
    message.success('User deleted')
    loadUsers()
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Failed to delete user')
  }
}

onMounted(() => {
  loadUsers()
})
</script>
