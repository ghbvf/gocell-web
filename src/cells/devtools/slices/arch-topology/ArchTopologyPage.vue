<template>
  <div style="position: relative; height: 100%;">
    <div style="position: absolute; top: 16px; left: 16px; z-index: 10; background: rgba(255,255,255,0.9); padding: 12px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2>架构拓扑 (Devtools)</h2>
      <p style="margin: 0; color: #666; font-size: 13px;">自动采集底层结构生成的依赖模型图</p>
    </div>

    <!-- 图形渲染区 -->
    <TopologyGraph @node-click="handleNodeClick" />

    <!-- 右侧滑出抽屉 -->
    <NodeDetailDrawer v-model:open="drawerOpen" :node="selectedNode" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopologyGraph from './TopologyGraph.vue'
import NodeDetailDrawer from './NodeDetailDrawer.vue'

const drawerOpen = ref(false)
const selectedNode = ref<any>(null)

const handleNodeClick = (node: any) => {
  selectedNode.value = node
  drawerOpen.value = true
}
</script>
