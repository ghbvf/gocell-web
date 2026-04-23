<template>
  <div>
    <div style="margin-bottom: 24px;">
      <h2>治理校验报告 (Governance)</h2>
      <p style="color: #666;">运行架构规则引擎，扫描 Cell/Slice/Contract 元数据，检查依赖缺失、循环依赖、规范一致性等问题。</p>
    </div>

    <!-- Stats -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :span="8">
        <a-card>
          <a-statistic title="Errors (❌)" :value="summary.errors" valueStyle="color: #cf1322" />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic title="Warnings (⚠️)" :value="summary.warnings" valueStyle="color: #faad14" />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic title="Advisory/Info (💡)" :value="summary.infos" valueStyle="color: #1890ff" />
        </a-card>
      </a-col>
    </a-row>

    <!-- Table -->
    <a-card>
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <a-radio-group v-model:value="activeCategory" button-style="solid">
          <a-radio-button value="all">All</a-radio-button>
          <a-radio-button value="format">Format</a-radio-button>
          <a-radio-button value="reference">Reference</a-radio-button>
          <a-radio-button value="verify">Verify</a-radio-button>
          <a-radio-button value="advisory">Advisory</a-radio-button>
        </a-radio-group>
        <a-button type="primary" @click="reRun" :loading="isScanning">Re-Scan</a-button>
      </div>

      <a-table :columns="columns" :dataSource="filteredResults" rowKey="id" :pagination="{ pageSize: 15 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ruleId'">
            <a-tag color="blue">{{ record.ruleId }}</a-tag>
          </template>
          <template v-else-if="column.key === 'severity'">
            <a-tag v-if="record.severity === 'error'" color="error">❌ Error</a-tag>
            <a-tag v-else-if="record.severity === 'warning'" color="warning">⚠️ Warning</a-tag>
            <a-tag v-else color="processing">💡 Info</a-tag>
          </template>
          <template v-else-if="column.key === 'message'">
            <div>{{ record.message }}</div>
            <div v-if="record.file" style="font-size: 12px; color: #888; margin-top: 4px;">
              📁 {{ record.file }}
            </div>
            <div v-if="record.suggestion" style="font-size: 12px; color: #52c41a; margin-top: 4px;">
              👉 建议: {{ record.suggestion }}
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { parseDevtoolsData } from '../../shared/parser'
import { runGovernanceChecks } from './rules'
import type { GovernanceResult } from './types'

const results = ref<(GovernanceResult & { id: number })[]>([])
const activeCategory = ref('all')
const isScanning = ref(false)

const columns = [
  { title: 'Severity', key: 'severity', width: 120 },
  { title: 'Rule ID', key: 'ruleId', width: 120 },
  { title: 'Details', key: 'message' }
]

const loadData = () => {
  isScanning.value = true
  setTimeout(() => {
    // Force reload parsing if needed
    const data = parseDevtoolsData(true)
    const checks = runGovernanceChecks(data)
    results.value = checks.map((r, i) => ({ ...r, id: i }))
    isScanning.value = false
  }, 500)
}

onMounted(() => {
  loadData()
})

const reRun = () => {
  loadData()
}

const summary = computed(() => {
  return {
    errors: results.value.filter(r => r.severity === 'error').length,
    warnings: results.value.filter(r => r.severity === 'warning').length,
    infos: results.value.filter(r => r.severity === 'info').length
  }
})

const filteredResults = computed(() => {
  if (activeCategory.value === 'all') return results.value
  return results.value.filter(r => r.category === activeCategory.value)
})
</script>
