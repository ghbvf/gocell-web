<template>
  <a-card :bodyStyle="{ padding: '16px' }" hoverable style="border-radius: 8px;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <div>
        <h4 style="margin: 0; font-size: 16px; font-weight: 600;">{{ contract.id }}</h4>
        <div style="margin-top: 4px; display: flex; gap: 8px;">
          <a-tag :color="kindColor">{{ contract.kind.toUpperCase() }}</a-tag>
          <a-tag v-if="contract.lifecycle === 'active'" color="success">GA</a-tag>
          <a-tag v-else-if="contract.lifecycle === 'deprecated'" color="error">Deprecated</a-tag>
          <a-tag v-else color="warning">{{ contract.lifecycle || 'Draft' }}</a-tag>
          <a-tag v-if="contract.consistencyLevel" color="purple">{{ contract.consistencyLevel }}</a-tag>
        </div>
      </div>
      <a-tag>Owner: {{ contract.ownerCell }}</a-tag>
    </div>

    <!-- Endpoint Info -->
    <div v-if="contract.endpoints?.http" style="margin-bottom: 12px; background: #fafafa; padding: 8px; border-radius: 4px;">
      <a-typography-text strong style="margin-right: 8px;">Endpoint:</a-typography-text>
      <a-tag :color="methodColor(contract.endpoints.http.method)">{{ contract.endpoints.http.method }}</a-tag>
      <a-typography-text code>{{ contract.endpoints.http.path }}</a-typography-text>
    </div>

    <!-- Usages -->
    <div v-if="contract.usedBy && contract.usedBy.length > 0">
      <div style="font-size: 12px; color: #888; margin-bottom: 4px;">Usages in Slices:</div>
      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
        <a-tooltip v-for="usage in contract.usedBy" :key="`${usage.cellId}-${usage.sliceId}-${usage.role}`" :title="`${usage.cellId} / ${usage.sliceId}`">
          <a-tag :color="roleColor(usage.role)" style="cursor: pointer;" @click="handleSliceClick(usage)">
            {{ usage.role }}: {{ usage.sliceId }}
          </a-tag>
        </a-tooltip>
      </div>
    </div>
    <div v-else>
      <a-typography-text type="secondary" style="font-size: 12px;">No slice usages found.</a-typography-text>
    </div>

    <!-- YAML Collapse -->
    <a-collapse ghost size="small" style="margin-top: 8px;">
      <a-collapse-panel key="1" header="View Source YAML">
        <pre style="background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 12px; overflow-x: auto; margin: 0;">{{ contract.rawYaml }}</pre>
      </a-collapse-panel>
    </a-collapse>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ContractDetail } from './types'
import { useRouter } from 'vue-router'

const props = defineProps<{ contract: ContractDetail }>()
const router = useRouter()

const kindColor = computed(() => {
  switch (props.contract.kind) {
    case 'http': return 'blue'
    case 'event': return 'green'
    case 'command': return 'orange'
    case 'projection': return 'cyan'
    default: return 'default'
  }
})

const methodColor = (method?: string) => {
  switch (method?.toUpperCase()) {
    case 'GET': return 'blue'
    case 'POST': return 'green'
    case 'PUT': return 'orange'
    case 'DELETE': return 'red'
    default: return 'default'
  }
}

const roleColor = (role: string) => {
  switch (role) {
    case 'serve': return 'blue'
    case 'call': return 'orange'
    case 'publish': return 'green'
    case 'subscribe': return 'purple'
    default: return 'default'
  }
}

const handleSliceClick = (usage: any) => {
  router.push({
    path: '/devtools/topology',
    // Not implemented visually in topology graph yet, but passes the context
    query: { focusNode: `slice:${usage.cellId}/${usage.sliceId}` }
  })
}
</script>
