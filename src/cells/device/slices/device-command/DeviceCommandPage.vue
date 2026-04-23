<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2>{{ $t('device.commandControl', '设备命令控制') }} - {{ deviceId }}</h2>
      <div>
        <a-button @click="$router.back()" style="margin-right: 8px;">Back</a-button>
        <a-button type="primary" @click="modalOpen = true">{{ $t('device.sendCommand', '下发命令') }}</a-button>
      </div>
    </div>

    <a-alert
      message="RBAC Authorization Required"
      description="下发 IoT 命令已强制接入 RBAC 安全阻断。你需要使用 Seed Admin 或等同 admin 角色账号登录才可下发操作指令。"
      type="warning"
      show-icon
      style="margin-bottom: 24px;"
    />

    <a-row :gutter="16">
      <a-col :span="8">
        <!-- Status pane placeholder for 4.1.5 -->
        <a-card :title="$t('device.statusTitle')">
          <p>Integration with Device Manage Status...</p>
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card>
          <CommandTimeline :deviceId="deviceId" ref="timelineRef" />
        </a-card>
      </a-col>
    </a-row>

    <CommandSendModal
      v-model:open="modalOpen"
      :deviceId="deviceId"
      @success="handleCommandSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import CommandTimeline from './CommandTimeline.vue'
import CommandSendModal from './CommandSendModal.vue'

const route = useRoute()
const deviceId = computed(() => route.params.id as string)

const modalOpen = ref(false)
const timelineRef = ref()

const handleCommandSent = () => {
  if (timelineRef.value) {
    timelineRef.value.loadCommands()
  }
}
</script>
