<template>
  <a-card :bodyStyle="{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }" hoverable style="border-radius: 8px; height: 100%;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
      <h4 style="margin: 0; font-size: 16px; font-weight: 600; cursor: pointer; color: #1890ff;" @click="$emit('view-detail', journey)">
        {{ journey.id }}
      </h4>
      <div style="display: flex; gap: 4px;">
        <a-tag :color="stateColor">{{ journeyStatus?.state || 'todo' }}</a-tag>
        <a-tag v-if="journeyStatus?.risk" :color="riskColor">{{ journeyStatus.risk }}</a-tag>
      </div>
    </div>
    
    <p style="color: #555; margin-bottom: 12px; font-size: 14px; flex-grow: 1;">{{ journey.goal }}</p>

    <div style="margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 4px;">
      <a-tag v-for="cell in journey.cells" :key="cell" size="small" color="blue">{{ cell }}</a-tag>
    </div>

    <!-- Pass Criteria Progress -->
    <div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
        <span>Pass Criteria ({{ passCriteriaCount }})</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; background: #fafafa; padding: 8px; border-radius: 4px; max-height: 120px; overflow-y: auto;">
        <div v-for="(pc, idx) in journey.passCriteria" :key="idx" style="display: flex; align-items: flex-start; gap: 6px;">
          <span v-if="pc.mode === 'auto'" style="color: #1890ff; flex-shrink: 0;">⚙️</span>
          <span v-else style="color: #faad14; flex-shrink: 0;">📋</span>
          <span style="color: #666; line-height: 1.4;">{{ pc.text }}</span>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JourneyMeta, JourneyStatus } from './types'

const props = defineProps<{ 
  journey: JourneyMeta,
  journeyStatus?: JourneyStatus
}>()

defineEmits(['view-detail'])

const stateColor = computed(() => {
  const state = props.journeyStatus?.state || 'todo'
  switch (state.toLowerCase()) {
    case 'done': return 'success'
    case 'doing': return 'processing'
    case 'todo': return 'default'
    default: return 'default'
  }
})

const riskColor = computed(() => {
  const risk = props.journeyStatus?.risk || 'low'
  switch (risk.toLowerCase()) {
    case 'high': return 'error'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'default'
  }
})

const passCriteriaCount = computed(() => {
  return props.journey.passCriteria?.length || 0
})
</script>
