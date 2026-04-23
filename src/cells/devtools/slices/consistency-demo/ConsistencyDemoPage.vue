<template>
  <div>
    <div style="margin-bottom: 24px;">
      <h2>一致性级别演示 (Consistency Level)</h2>
      <p style="color: #666;">交互式演示 GoCell 框架 L0-L4 一致性级别的实际运行时语义，包含代码层面的触发以及数据/事件流转的监控。</p>
    </div>

    <a-tabs v-model:activeKey="activeLevel">
      <!-- L0 LocalOnly -->
      <a-tab-pane key="l0" tab="L0 LocalOnly">
        <ConsistencyLevelCard
          title="L0: LocalOnly 无副作用计算"
          level="L0"
          color="default"
          description="单机无状态操作，不涉及数据库事务，也不产生任何事件。例如数据校验、计算、内存缓存读取等。"
          :logs="logs"
          @action="runL0"
        >
          <template #flow>
            <div style="padding-left: 16px; border-left: 2px solid #ccc;">
              <div style="margin-bottom: 8px;">GET /api/v1/healthz</div>
              <div>&nbsp;&nbsp;├─ Health Check (Memory) ✅</div>
              <div>&nbsp;&nbsp;└─ Return 200 OK ✅</div>
            </div>
          </template>
          <template #action-text>执行无状态请求</template>
        </ConsistencyLevelCard>
      </a-tab-pane>

      <!-- L1 LocalTx -->
      <a-tab-pane key="l1" tab="L1 LocalTx">
        <ConsistencyLevelCard
          title="L1: LocalTx 单库事务"
          level="L1"
          color="blue"
          description="单机单数据库事务操作。所有写操作包裹在同一个 BEGIN ... COMMIT 块中。不触发任何系统外部事件。"
          :loading="loading"
          :logs="logs"
          @action="runL1"
        >
          <template #flow>
            <div style="padding-left: 16px; border-left: 2px solid #1890ff;">
              <div style="margin-bottom: 8px;">BEGIN TX</div>
              <div>&nbsp;&nbsp;├─ INSERT access_users (business data) ✅</div>
              <div style="margin-top: 8px;">COMMIT TX</div>
            </div>
          </template>
          <template #action-text>创建演示用户</template>
        </ConsistencyLevelCard>
      </a-tab-pane>

      <!-- L2 OutboxFact -->
      <a-tab-pane key="l2" tab="L2 OutboxFact">
        <ConsistencyLevelCard
          title="L2: OutboxFact 事务发件箱"
          level="L2"
          color="cyan"
          description="业务操作与事件发布在同一数据库事务中完成。事件先写入 Outbox 表，再由 Relay 异步投递到消息队列，保证原子性。"
          :loading="loading"
          :logs="logs"
          @action="runL2"
        >
          <template #flow>
            <div style="padding-left: 16px; border-left: 2px solid #13c2c2;">
              <div style="margin-bottom: 8px;">BEGIN TX</div>
              <div>&nbsp;&nbsp;├─ INSERT orders (business data) ✅</div>
              <div>&nbsp;&nbsp;├─ INSERT outbox_entry (event) ✅</div>
              <div style="margin-top: 8px; margin-bottom: 12px;">COMMIT TX</div>
              <div style="color: #666; font-style: italic;">--- async boundary ---</div>
              <div style="margin-top: 12px;">Relay polls outbox → Publish to Broker ⏳</div>
            </div>
          </template>
          <template #action-text>创建演示订单</template>
        </ConsistencyLevelCard>
      </a-tab-pane>

      <!-- L3 WorkflowEventual -->
      <a-tab-pane key="l3" tab="L3 WorkflowEventual">
        <ConsistencyLevelCard
          title="L3: WorkflowEventual 最终一致工作流"
          level="L3"
          color="purple"
          description="基于事件的跨 Cell/跨服务最终一致性。Cell A 的事件被 Cell B 消费，形成编排或编舞流。例如：登录 -> 触发审计。"
          :loading="loading"
          :logs="logs"
          @action="runL3"
        >
          <template #flow>
            <div style="padding-left: 16px; border-left: 2px solid #722ed1;">
              <div style="margin-bottom: 8px;">[access-core] Auth Login</div>
              <div>&nbsp;&nbsp;├─ Publish event.session.created ✅</div>
              <div style="color: #666; font-style: italic; margin-top: 12px; margin-bottom: 12px;">--- broker ---</div>
              <div style="margin-top: 8px;">[audit-core] Consume event.session.created ⏳</div>
              <div>&nbsp;&nbsp;├─ Audit Appended ⏳</div>
            </div>
          </template>
          <template #action-text>触发登录 + 审计联动</template>
        </ConsistencyLevelCard>
      </a-tab-pane>

      <!-- L4 DeviceLatent -->
      <a-tab-pane key="l4" tab="L4 DeviceLatent">
        <ConsistencyLevelCard
          title="L4: DeviceLatent 高延迟设备轮询"
          level="L4"
          color="orange"
          description="针对不在线或高延迟 IoT 设备的命令下发。命令进队列 -> 设备轮询获取 -> 设备执行完毕后返回 ACK -> 更新最终状态。"
          :loading="loading"
          :logs="logs"
          @action="runL4"
        >
          <template #flow>
            <div style="padding-left: 16px; border-left: 2px solid #fa8c16;">
              <div style="margin-bottom: 8px;">POST /commands (Client)</div>
              <div>&nbsp;&nbsp;├─ Save command as PENDING ✅</div>
              <div style="color: #666; font-style: italic; margin-top: 12px; margin-bottom: 12px;">--- high latency boundary ---</div>
              <div style="margin-top: 8px;">GET /commands (Device Poll) ⏳</div>
              <div>POST /commands/ack (Device Done) ⏳</div>
              <div>&nbsp;&nbsp;├─ Mark command as SUCCESS ⏳</div>
            </div>
          </template>
          <template #action-text>下发虚拟设备指令</template>
        </ConsistencyLevelCard>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ConsistencyLevelCard from './ConsistencyLevelCard.vue'
import type { EventLog } from './types'
import { createDemoUser, createDemoOrder, demoLogin, sendDeviceCommand } from './api'

const activeLevel = ref('l0')
const loading = ref(false)
const logs = ref<EventLog[]>([])

const addLog = (action: string, status: 'pending' | 'success' | 'error', detail?: string) => {
  const d = new Date()
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`
  
  if (status === 'pending') {
    logs.value.push({
      id: Math.random().toString(36).substring(7),
      timestamp: time,
      action,
      status,
      detail
    })
  } else {
    // Find the last pending log with same action to update, or just push new
    const idx = [...logs.value].reverse().findIndex(l => l.action.includes(action.split(' ')[0]) && l.status === 'pending')
    if (idx !== -1) {
      const realIdx = logs.value.length - 1 - idx
      logs.value[realIdx].status = status
      if (detail) logs.value[realIdx].detail = detail
    } else {
      logs.value.push({
        id: Math.random().toString(36).substring(7),
        timestamp: time,
        action,
        status,
        detail
      })
    }
  }
}

watch(activeLevel, () => {
  logs.value = [] // Clear logs when switching tabs
})

// === L0 ===
const runL0 = () => {
  logs.value = []
  addLog('HealthCheck / L0', 'success', 'Evaluated locally without DB Tx.')
}

// === L1 ===
const runL1 = async () => {
  logs.value = []
  loading.value = true
  addLog('Create User Tx', 'pending')
  try {
    const payload = { username: `user_${Date.now()}`, password: 'password' }
    const res = await createDemoUser(payload)
    addLog('Create User Tx', 'success', `User created with ID: ${res.data?.id || 'unknown'}. No events published.`)
  } catch (error: any) {
    addLog('Create User Tx', 'error', error.response?.data?.message || error.message)
  } finally {
    loading.value = false
  }
}

// === L2 ===
const runL2 = async () => {
  logs.value = []
  loading.value = true
  addLog('Create Order Tx', 'pending')
  try {
    await createDemoOrder({ item: `L2_Demo_Item_${Date.now()}` })
    addLog('Create Order Tx', 'success', 'Order and outbox event persisted in same local Tx.')
    
    // Simulate Outbox relay propagation
    setTimeout(() => {
      addLog('Outbox Relay poll', 'pending')
      setTimeout(() => {
        addLog('Outbox Relay poll', 'success', 'event.order.created published to Broker.')
      }, 500)
    }, 1000)

  } catch (error: any) {
    addLog('Create Order Tx', 'error', error.response?.data?.message || 'Failed connecting to :8082 (order-cell)')
  } finally {
    loading.value = false
  }
}

// === L3 ===
const runL3 = async () => {
  logs.value = []
  loading.value = true
  addLog('Login (access-core)', 'pending')
  try {
    await demoLogin({ username: 'admin', password: 'password' })
    addLog('Login (access-core)', 'success', `Logged in. Session Event outboxed.`)
    
    setTimeout(() => {
      addLog('Broker Dispatch', 'pending')
      setTimeout(() => {
        addLog('Broker Dispatch', 'success', 'Audit-core consumed event.session.created.')
        addLog('Audit Log (audit-core)', 'success', 'Audit hash chain updated.')
      }, 800)
    }, 1000)

  } catch (error: any) {
    addLog('Login (access-core)', 'error', error.response?.data?.message || 'Failed connecting to :8081 (sso-bff)')
  } finally {
    loading.value = false
  }
}

// === L4 ===
const runL4 = async () => {
  logs.value = []
  loading.value = true
  const deviceId = `dev_${Date.now()}`
  addLog(`Submit Command to Device ${deviceId}`, 'pending')
  
  try {
    await sendDeviceCommand(deviceId, { cmd: 'restart', timeout: 5000 })
    addLog(`Submit Command to Device ${deviceId}`, 'success', 'Command persisted in queue.')
    
    setTimeout(() => {
      addLog(`Device Polling`, 'pending', `Device ${deviceId} waking up...`)
      setTimeout(() => {
        addLog(`Device Polling`, 'success', `Command fetched.`)
        setTimeout(() => {
          addLog(`Device Executing`, 'success', `Done. Calling /ack...`)
          setTimeout(() => {
            addLog(`Command State Update`, 'success', `Final state: SUCCESS.`)
          }, 300)
        }, 1200)
      }, 800)
    }, 1500)

  } catch (error: any) {
    addLog(`Submit Command`, 'error', error.response?.data?.message || 'Failed connecting to :8083 (device-cell)')
  } finally {
    loading.value = false
  }
}
</script>
