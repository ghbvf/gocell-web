<template>
  <div>
    <h2>RBAC Administration</h2>
    <a-card title="System Roles" style="margin-bottom: 24px;">
      <a-table :dataSource="roles" :columns="columns" rowKey="id" />
    </a-card>
    
    <a-descriptions title="Current Policy Configuration" bordered>
      <a-descriptions-item label="Strategy">Role-based Access Control (RBAC)</a-descriptions-item>
      <a-descriptions-item label="Engine">GoCell Access Core</a-descriptions-item>
      <a-descriptions-item label="Status">Enforcing</a-descriptions-item>
    </a-descriptions>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchRoles } from './api'
import type { Role } from './types'

const roles = ref<Role[]>([])

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Role Name', dataIndex: 'name', key: 'name' },
  { title: 'Description', dataIndex: 'description', key: 'description' }
]

onMounted(async () => {
  roles.value = await fetchRoles()
})
</script>
