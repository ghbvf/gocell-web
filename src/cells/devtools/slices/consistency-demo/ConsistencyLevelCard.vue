<template>
  <a-card style="border-radius: 8px;">
    <template #title>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 18px; font-weight: bold; color: #1890ff;">{{ title }}</span>
        <a-tag :color="color">{{ level }}</a-tag>
      </div>
    </template>
    
    <div style="margin-bottom: 16px;">
      <h4 style="color: #666;">📖 说明</h4>
      <p style="font-size: 14px; line-height: 1.6;">{{ description }}</p>
    </div>

    <!-- Data flow visualization -->
    <div style="background: #fafafa; padding: 16px; border-radius: 8px; margin-bottom: 24px; min-height: 150px;">
      <h4 style="margin-top: 0; color: #666;">🔄 数据流图</h4>
      <div class="flow-container">
        <!-- Rendered via CSS/HTML based on level -->
        <slot name="flow"></slot>
      </div>
    </div>

    <!-- Action area -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0; color: #666;">🎮 试一试</h4>
        <a-button type="primary" @click="$emit('action')" :loading="loading">
          <slot name="action-text">执行</slot>
        </a-button>
      </div>

      <div v-if="logs.length > 0" style="background: #1e1e1e; padding: 12px; border-radius: 4px; color: #a9b7c6; font-family: monospace; font-size: 13px; max-height: 200px; overflow-y: auto;">
        <div v-for="log in logs" :key="log.id" style="margin-bottom: 4px;">
          <span style="color: #888;">[{{ log.timestamp }}]</span> 
          <span :style="{ color: log.status === 'success' ? '#629755' : log.status === 'error' ? '#cc666e' : '#ffc66d' }">
            {{ log.status === 'success' ? '✅' : log.status === 'error' ? '❌' : '⏳' }}
          </span> 
          {{ log.action }}
          <div v-if="log.detail" style="padding-left: 24px; color: #cc7832;">
            {{ log.detail }}
          </div>
        </div>
      </div>
      <div v-else style="color: #bfbfbf; font-style: italic; text-align: center; padding: 16px;">
        点击上方的按钮开始演示过程...
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import type { EventLog } from './types'

defineProps<{
  title: string
  level: string
  color: string
  description: string
  loading?: boolean
  logs: EventLog[]
}>()

defineEmits(['action'])
</script>

<style scoped>
.flow-container {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}
/* Flow specific styles can be passed in from parent depending on the level */
</style>
