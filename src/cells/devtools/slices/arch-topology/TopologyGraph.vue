<template>
  <div style="position: relative; width: 100%; height: 100vh; overflow: hidden;">
    <!-- The graph container -->
    <div ref="container" style="width: 100%; height: 100%; background: #fafafa; border-radius: 8px;"></div>
    
    <!-- Tree control panel -->
    <a-card size="small" title="图层选区过滤" style="position: absolute; top: 110px; left: 16px; width: 300px; max-height: calc(100vh - 140px); overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;">
      <a-tree
        v-model:checkedKeys="checkedKeys"
        checkable
        defaultExpandAll
        :tree-data="treeData"
        @check="updateGraphData"
      />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Graph } from '@antv/g6'
import { parseTopology } from './parser'
import { buildGraphData } from './graph-data'
import type { TopologyData } from './types'

const emit = defineEmits(['node-click'])
const container = ref<HTMLElement | null>(null)
let graph: any = null
let topoData: TopologyData | null = null

const checkedKeys = ref<string[]>([])
const treeData = ref<any[]>([])
let currentGraphData: any = null

const buildTreeData = (data: TopologyData) => {
  const tree: any[] = []
  
  // 1. Cells and Slices
  const cellNodes = data.cells.map(cell => {
    const slicesInCell = data.slices.filter(s => s.belongsToCell === cell.id)
    return {
      title: cell.id,
      key: `cell:${cell.id}`,
      children: slicesInCell.map(s => ({
        title: s.id,
        key: `slice:${cell.id}/${s.id}`
      }))
    }
  })
  
  tree.push({
    title: '业务切片 (Cells)',
    key: 'group:cells',
    children: cellNodes
  })

  // 2. Contracts
  const contractNodes = data.contracts.map(c => ({
    title: c.id,
    key: `contract:${c.id}`
  }))
  tree.push({
    title: '外部契约 (Contracts)',
    key: 'group:contracts',
    children: contractNodes
  })

  // 3. Core Layers
  const coreNodes = [
    { title: 'Kernel', key: 'layer:kernel' },
    { title: 'Runtime', key: 'layer:runtime' },
    { title: 'Adapters', key: 'layer:adapters' },
    { title: 'Pkg', key: 'layer:pkg' },
  ]
  tree.push({
    title: '底层架构 (Core)',
    key: 'group:core',
    children: coreNodes
  })

  return tree
}

const collectAllKeys = (nodes: any[]): string[] => {
  let keys: string[] = []
  nodes.forEach(n => {
    keys.push(n.key)
    if (n.children) keys = keys.concat(collectAllKeys(n.children))
  })
  return keys
}

const updateGraphData = () => {
  if (!graph || !topoData) return
  currentGraphData = buildGraphData(topoData, checkedKeys.value)
  graph.setData(currentGraphData)
  graph.render()
}

onMounted(() => {
  if (!container.value) return

  topoData = parseTopology()
  treeData.value = buildTreeData(topoData)
  checkedKeys.value = collectAllKeys(treeData.value)

  currentGraphData = buildGraphData(topoData, checkedKeys.value)

  graph = new Graph({
    container: container.value,
    autoFit: 'view',
    data: currentGraphData,
    layout: {
      type: 'dagre',
      rankdir: 'TB',
      align: 'UL',
      nodesep: 50,
      ranksep: 80,
      sortByCombo: true,
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element', 'collapse-expand-combo'],
    combo: {
      type: 'rect',
      style: {
        fill: '#f0f0f0',
        stroke: '#ccc',
        lineWidth: 1,
      },
      state: {
        active: { stroke: '#1890ff', lineWidth: 2 },
      }
    },
  })

  graph.render()

  graph.on('node:click', (evt: any) => {
    const nodeId = evt.target?.id || evt.target?.parent?.id
    if (!nodeId || !currentGraphData) return
    const node = currentGraphData.nodes.find((n: any) => n.id === nodeId)
    if (node) {
      emit('node-click', node)
    }
  })
})

onUnmounted(() => {
  if (graph) {
    graph.destroy()
  }
})
</script>
