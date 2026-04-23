<template>
  <div style="padding: 16px;">
    <h3>{{ $t('device.timeline') }}</h3>
    <a-button type="dashed" @click="loadCommands" block style="margin-bottom: 24px;">Refresh</a-button>

    <a-timeline>
      <a-timeline-item v-for="cmd in commands" :key="cmd.id" :color="getColor(cmd.status)">
        <p><strong>ID:</strong> {{ cmd.id }}</p>
        <p><strong>Payload:</strong> {{ cmd.payload }}</p>
        <p><strong>Created:</strong> {{ cmd.createdAt }}</p>
        <p>
          <a-tag :color="getColor(cmd.status)">{{ cmd.status }}</a-tag>
          <a-button 
            v-if="cmd.status === 'PENDING'" 
            type="link" 
            size="small" 
            :loading="acking === cmd.id"
            @click="handleAck(cmd.id)"
          >
            Simulate ACK
          </a-button>
        </p>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { fetchCommands, ackCommand } from './api'
import type { Command } from './types'

const props = defineProps<{ deviceId: string }>()
const commands = ref<Command[]>([])
const loading = ref(false)
const acking = ref<string | null>(null)

const getColor = (status: string) => {
  if (status === 'COMPLETED' || status === 'ACKED') return 'green'
  if (status === 'FAILED') return 'red'
  return 'blue'
}

const loadCommands = async () => {
  loading.value = true
  try {
    commands.value = await fetchCommands(props.deviceId)
  } finally {
    loading.value = false
  }
}

const handleAck = async (cmdId: string) => {
  acking.value = cmdId
  try {
    await ackCommand(props.deviceId, cmdId)
    message.success('Command ACKed')
    await loadCommands()
  } catch (err: any) {
    message.error('Failed to ACK command')
  } finally {
    acking.value = null
  }
}

defineExpose({ loadCommands })

onMounted(() => {
  loadCommands()
})
</script>
