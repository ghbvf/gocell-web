<template>
  <div>
    <div style="margin-bottom: 24px;">
      <h2>Journey 验收看板</h2>
      <p style="color: #666;">端到端 Acceptance Journey 规范，跨 Cell 业务流程和契约验证状态。</p>
    </div>

    <!-- Statistics -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :xs="12" :md="6">
        <a-card>
          <a-statistic title="Total Journeys" :value="journeys.length" />
        </a-card>
      </a-col>
      <a-col :xs="12" :md="6">
        <a-card>
          <a-statistic title="Done (✅)" :value="doneCount" valueStyle="color: #3f8600" />
        </a-card>
      </a-col>
      <a-col :xs="12" :md="6">
        <a-card>
          <a-statistic title="Doing (🟡)" :value="doingCount" valueStyle="color: #1890ff" />
        </a-card>
      </a-col>
      <a-col :xs="12" :md="6">
        <a-card>
          <a-statistic title="Todo (⬜)" :value="todoCount" valueStyle="color: #888" />
        </a-card>
      </a-col>
    </a-row>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <a-radio-group v-model:value="viewMode" button-style="solid">
        <a-radio-button value="kanban">看板 (Kanban)</a-radio-button>
        <a-radio-button value="list">列表 (List)</a-radio-button>
      </a-radio-group>
    </div>

    <!-- Kanban View -->
    <div v-if="viewMode === 'kanban'" class="kanban-board">
      <div class="kanban-column">
        <h3 class="column-title todo-title">Todo ({{ todoCount }})</h3>
        <div class="column-content">
          <div v-for="j in todoJourneys" :key="j.id" class="journey-card-wrapper">
            <JourneyCard :journey="j" :journeyStatus="getStatus(j.id)" @view-detail="openDetail" />
          </div>
        </div>
      </div>
      <div class="kanban-column">
        <h3 class="column-title doing-title">Doing ({{ doingCount }})</h3>
        <div class="column-content">
          <div v-for="j in doingJourneys" :key="j.id" class="journey-card-wrapper">
            <JourneyCard :journey="j" :journeyStatus="getStatus(j.id)" @view-detail="openDetail" />
          </div>
        </div>
      </div>
      <div class="kanban-column">
        <h3 class="column-title done-title">Done ({{ doneCount }})</h3>
        <div class="column-content">
          <div v-for="j in doneJourneys" :key="j.id" class="journey-card-wrapper">
            <JourneyCard :journey="j" :journeyStatus="getStatus(j.id)" @view-detail="openDetail" />
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <a-table v-else :columns="columns" :dataSource="journeys" rowKey="id" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'state'">
          <a-tag :color="getStatus(record.id)?.state === 'done' ? 'success' : getStatus(record.id)?.state === 'doing' ? 'processing' : 'default'">
            {{ getStatus(record.id)?.state || 'todo' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'cells'">
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            <a-tag v-for="c in record.cells" :key="c" color="blue">{{ c }}</a-tag>
          </div>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" @click="openDetail(record)">Details</a-button>
        </template>
      </template>
    </a-table>

    <!-- Detail Drawer -->
    <JourneyDetailDrawer 
      v-model:open="drawerOpen" 
      :journey="selectedJourney"
      :status="selectedJourney ? (getStatus(selectedJourney.id) || null) : null" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { parseDevtoolsData } from '../../shared/parser'
import type { JourneyMeta, JourneyStatus } from './types'
import JourneyCard from './JourneyCard.vue'
import JourneyDetailDrawer from './JourneyDetailDrawer.vue'

const journeys = ref<JourneyMeta[]>([])
const statuses = ref<JourneyStatus[]>([])
const viewMode = ref('kanban')

const drawerOpen = ref(false)
const selectedJourney = ref<JourneyMeta | null>(null)

const columns = [
  { title: 'Journey ID', dataIndex: 'id', key: 'id' },
  { title: 'State', key: 'state', width: 100 },
  { title: 'Goal', dataIndex: 'goal', key: 'goal' },
  { title: 'Cells', key: 'cells' },
  { title: 'Action', key: 'action', width: 100 }
]

onMounted(() => {
  const data = parseDevtoolsData()
  journeys.value = data.journeys
  statuses.value = data.journeyStatuses
})

const getStatus = (id: string) => {
  return statuses.value.find(s => s.journeyId === id) || undefined
}

const getState = (id: string) => {
  const s = getStatus(id)
  return s ? s.state : 'todo'
}

const doneCount = computed(() => journeys.value.filter(j => getState(j.id) === 'done').length)
const doingCount = computed(() => journeys.value.filter(j => getState(j.id) === 'doing').length)
const todoCount = computed(() => journeys.value.filter(j => getState(j.id) === 'todo').length)

const doneJourneys = computed(() => journeys.value.filter(j => getState(j.id) === 'done'))
const doingJourneys = computed(() => journeys.value.filter(j => getState(j.id) === 'doing'))
const todoJourneys = computed(() => journeys.value.filter(j => getState(j.id) === 'todo'))

const openDetail = (journey: JourneyMeta) => {
  selectedJourney.value = journey
  drawerOpen.value = true
}
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 24px;
  min-height: 500px;
  flex-wrap: wrap; /* responsive */
}

.kanban-column {
  flex: 1;
  min-width: 300px;
  background: #f0f2f5;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.column-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8e8e8;
}

.todo-title { border-bottom-color: #d9d9d9; }
.doing-title { border-bottom-color: #1890ff; }
.done-title { border-bottom-color: #52c41a; }

.column-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-grow: 1;
}

.journey-card-wrapper {
  /* wrapper ensures flex items inside render fine */
}
</style>
