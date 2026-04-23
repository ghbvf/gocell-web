<template>
  <a-drawer
    :open="open"
    :title="`Journey: ${journey?.id}`"
    width="600"
    @close="$emit('update:open', false)"
  >
    <div v-if="journey">
      <a-descriptions title="Meta Info" bordered size="small" :column="1" style="margin-bottom: 24px;">
        <a-descriptions-item label="Goal">{{ journey.goal }}</a-descriptions-item>
        <a-descriptions-item label="Owner">
          {{ journey.owner?.team }} / {{ journey.owner?.role }}
        </a-descriptions-item>
        <a-descriptions-item label="State">
          <a-tag :color="status?.state === 'done' ? 'success' : status?.state === 'doing' ? 'processing' : 'default'">
            {{ status?.state || 'todo' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Risk" v-if="status?.risk">
          <a-tag :color="status?.risk === 'high' ? 'error' : status?.risk === 'medium' ? 'warning' : 'success'">
            {{ status.risk }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Updated At" v-if="status?.updatedAt">
          {{ status.updatedAt }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider>Involved Cells & Contracts</a-divider>
      
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 14px; margin-bottom: 8px;">Cells</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a-tag v-for="cell in journey.cells" :key="cell" color="blue">{{ cell }}</a-tag>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 14px; margin-bottom: 8px;">Contracts</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a-tag v-for="contract in journey.contracts" :key="contract" color="cyan">{{ contract }}</a-tag>
        </div>
      </div>

      <a-divider>Pass Criteria ({{ journey.passCriteria?.length || 0 }})</a-divider>
      <a-list item-layout="horizontal" :data-source="journey.passCriteria" style="margin-bottom: 24px;">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :description="item.checkRef ? `Check Ref: ${item.checkRef}` : ''">
              <template #title>
                <span v-if="item.mode === 'auto'" style="margin-right: 8px;" title="Automated">⚙️</span>
                <span v-else style="margin-right: 8px;" title="Manual">📋</span>
                {{ item.text }}
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>

      <a-divider>Raw Source YAML</a-divider>
      <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 12px;">{{ journey.rawYaml }}</pre>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import type { JourneyMeta, JourneyStatus } from './types'

defineProps<{ 
  open: boolean, 
  journey: JourneyMeta | null,
  status: JourneyStatus | null
}>()

defineEmits(['update:open'])
</script>
