import type { TopologyData } from './types'

export function buildGraphData(data: TopologyData, visibleKeys: string[]) {
  const nodes: any[] = []
  const edges: any[] = []
  const combos: any[] = []
  const keySet = new Set(visibleKeys)

  // Core Layers (Mocked for Infrastructure visualization)
  const coreLayers = [
    { id: 'kernel', label: 'Kernel Layer', color: '#f6ffed', stroke: '#b7eb8f' },
    { id: 'runtime', label: 'Runtime Layer', color: '#e6f7ff', stroke: '#91d5ff' },
    { id: 'adapters', label: 'Adapters (Infra)', color: '#fffb8f', stroke: '#ffe58f' },
    { id: 'pkg', label: 'Shared Packages (pkg)', color: '#f9f0ff', stroke: '#d3adf7' },
  ]

  coreLayers.forEach(layer => {
    if (keySet.has(`layer:${layer.id}`)) {
      combos.push({
        id: `core:${layer.id}`,
        data: { _nodeType: 'core_layer', id: layer.id },
        style: {
          type: 'rect',
          labelText: layer.label,
          labelPlacement: 'top',
          fill: layer.color,
          stroke: layer.stroke,
          lineWidth: 2,
          padding: [20, 20, 20, 20],
        }
      })

      // Add a dummy node inside the combo to give it volume and act as anchor for edges
      nodes.push({
        id: `core_node:${layer.id}`,
        combo: `core:${layer.id}`,
        data: { _nodeType: 'core_node', id: layer.id },
        style: { opacity: 0, size: 10 } // Invisible anchor
      })
    }
  })

  // Contracts (Standalone nodes representing interfaces/topics)
  data.contracts.forEach(contract => {
    if (keySet.has(`contract:${contract.id}`)) {
      let color = '#ccc'
      if (contract.kind === 'http') color = '#1890ff' // Blue
      if (contract.kind === 'command') color = '#faad14' // Orange
      if (contract.kind === 'event') color = '#52c41a' // Green

      nodes.push({
        id: `contract:${contract.id}`,
        data: { _nodeType: 'contract', ...contract },
        style: { fill: color, type: 'diamond', size: 40, labelText: contract.id, labelPlacement: 'bottom' }
      })
    }
  })

  // Cells as Combos (Grouping containers)
  data.cells.forEach(cell => {
    if (!keySet.has(`cell:${cell.id}`)) return

    combos.push({
      id: `cell:${cell.id}`,
      data: { _nodeType: 'cell', ...cell },
      style: {
        type: 'rect',
        labelText: cell.id,
        labelPlacement: 'top',
        fill: '#f0f5ff',
        stroke: '#adc6ff',
        lineWidth: 2,
        padding: [20, 20, 20, 20],
      }
    })

    // To preserve shape and provide anchor, every cell MUST have a dummy node.
    nodes.push({
      id: `dummy:${cell.id}`,
      combo: `cell:${cell.id}`,
      style: { opacity: 0, size: 10 }
    })

    // Create a dependency edge from Cell's dummy node to Kernel's dummy node
    if (keySet.has(`layer:kernel`)) {
      edges.push({
        source: `dummy:${cell.id}`, // Anchor inside cell
        target: `core_node:kernel`, // Anchor inside kernel
        style: { stroke: '#d9d9d9', type: 'line', endArrow: true, lineWidth: 2 }
      })
    }
  })

  // Slices inside Combos
  data.slices.forEach(slice => {
    if (!keySet.has(`cell:${slice.belongsToCell}`)) return
    if (!keySet.has(`slice:${slice.belongsToCell}/${slice.id}`)) return

    nodes.push({
      id: `slice:${slice.belongsToCell}/${slice.id}`,
      combo: `cell:${slice.belongsToCell}`,
      data: { _nodeType: 'slice', ...slice },
      style: { fill: '#ffffff', stroke: '#ffccc7', lineWidth: 2, size: 40, labelText: slice.id, labelPlacement: 'bottom' }
    })

    // Contract interactions
    slice.contractUsages.forEach(usage => {
      if (!keySet.has(`contract:${usage.contract}`)) return

      // If the slice Serves or Publishes, arrow goes FROM slice TO contract
      if (usage.role === 'serve' || usage.role === 'publish') {
        edges.push({
          source: `slice:${slice.belongsToCell}/${slice.id}`,
          target: `contract:${usage.contract}`,
          style: { stroke: '#1890ff', endArrow: true, lineWidth: 1.5 }
        })
      } else {
        // If the slice Requests or Subscribes, arrow goes FROM contract TO slice
        edges.push({
          source: `contract:${usage.contract}`,
          target: `slice:${slice.belongsToCell}/${slice.id}`,
          style: { stroke: '#faad14', lineDash: [4, 4], endArrow: true, lineWidth: 1.5 }
        })
      }
    })
  })

  // Draw global kernel to pkg edge and runtime to adapter edge for nice structure
  if (keySet.has('layer:kernel') && keySet.has('layer:pkg')) {
    edges.push({
      source: 'core_node:kernel',
      target: 'core_node:pkg',
      style: { stroke: '#d9d9d9', type: 'line', endArrow: true, lineWidth: 2 }
    })
  }
  if (keySet.has('layer:runtime') && keySet.has('layer:adapters')) {
    edges.push({
      source: 'core_node:runtime',
      target: 'core_node:adapters',
      style: { stroke: '#d9d9d9', type: 'line', endArrow: true, lineWidth: 2 }
    })
  }
  if (keySet.has('layer:adapters') && keySet.has('layer:kernel')) {
    edges.push({
      source: 'core_node:adapters',
      target: 'core_node:kernel',
      style: { stroke: '#d9d9d9', lineDash: [4, 4], endArrow: true, lineWidth: 2 }
    })
  }

  return { nodes, edges, combos }
}
