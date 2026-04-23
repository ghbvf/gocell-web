import yaml from 'js-yaml'
import type { 
  CellMeta, SliceMeta, ContractMeta, AssemblyMeta, 
  ContractDetail, JourneyMeta, JourneyStatus, DevtoolsData 
} from './types'

let cachedData: DevtoolsData | null = null

export function parseDevtoolsData(forceReload = false): DevtoolsData {
  if (cachedData && !forceReload) {
    return cachedData
  }

  const cells: CellMeta[] = []
  const slices: SliceMeta[] = []
  const contracts: ContractMeta[] = []
  const assemblies: AssemblyMeta[] = []
  const contractDetails: ContractDetail[] = []
  const journeys: JourneyMeta[] = []
  const journeyStatuses: JourneyStatus[] = []

  // Devtools metadata lives in the sibling backend repo during the current migration.
  // Keep the repo name explicit so the frontend can follow the new ../gocell layout.
  // @ts-ignore
  const cellYamls = import.meta.glob('../../../../../gocell/cells/*/cell.yaml', { query: '?raw', import: 'default', eager: true })
  // @ts-ignore
  const sliceYamls = import.meta.glob('../../../../../gocell/cells/*/slices/*/slice.yaml', { query: '?raw', import: 'default', eager: true })
  // @ts-ignore
  const contractYamls = import.meta.glob('../../../../../gocell/contracts/**/contract.yaml', { query: '?raw', import: 'default', eager: true })
  // @ts-ignore
  const assemblyYamls = import.meta.glob('../../../../../gocell/assemblies/*/assembly.yaml', { query: '?raw', import: 'default', eager: true })
  // @ts-ignore
  const journeyYamlFiles = import.meta.glob('../../../../../gocell/journeys/J-*.yaml', { query: '?raw', import: 'default', eager: true })
  // @ts-ignore
  const statusBoardYamls = import.meta.glob('../../../../../gocell/journeys/status-board.yaml', { query: '?raw', import: 'default', eager: true })

  for (const [path, content] of Object.entries(cellYamls)) {
    try {
      const doc = yaml.load(content as string) as any
      if (doc && doc.id) {
        cells.push({
          id: doc.id,
          type: doc.type || 'unknown',
          consistencyLevel: doc.consistencyLevel,
          owner: doc.owner,
          schema: doc.schema,
          verify: doc.verify,
          l0Dependencies: doc.l0Dependencies,
          rawYaml: content as string
        })
      }
    } catch (e) {
      console.warn('Failed to parse cell', path, e)
    }
  }

  for (const [path, content] of Object.entries(sliceYamls)) {
    try {
      const doc = yaml.load(content as string) as any
      if (doc && doc.id) {
        slices.push({
          id: doc.id,
          belongsToCell: doc.belongsToCell || 'unknown',
          contractUsages: doc.contractUsages || [],
          verify: doc.verify,
          rawYaml: content as string
        })
      }
    } catch (e) {
      console.warn('Failed to parse slice', path, e)
    }
  }

  for (const [path, content] of Object.entries(contractYamls)) {
    try {
      const doc = yaml.load(content as string) as any
      if (doc && doc.id) {
        contracts.push({
          id: doc.id,
          kind: doc.kind || 'unknown',
          ownerCell: doc.ownerCell || 'unknown',
          rawYaml: content as string
        })
        
        // Populate ContractDetail
        contractDetails.push({
          id: doc.id,
          kind: doc.kind || 'unknown',
          ownerCell: doc.ownerCell || 'unknown',
          consistencyLevel: doc.consistencyLevel,
          lifecycle: doc.lifecycle,
          endpoints: doc.endpoints,
          schemaRefs: doc.schemaRefs,
          usedBy: [], // will be filled next
          rawYaml: content as string
        })
      }
    } catch (e) {
      console.warn('Failed to parse contract', path, e)
    }
  }

  // Cross-reference ContractDetails with Slice usages
  for (const slice of slices) {
    if (slice.contractUsages) {
      for (const usage of slice.contractUsages) {
        const targetContract = contractDetails.find(c => c.id === usage.contract)
        if (targetContract) {
          targetContract.usedBy.push({
            sliceId: slice.id,
            cellId: slice.belongsToCell,
            role: usage.role
          })
        }
      }
    }
  }

  for (const [path, content] of Object.entries(assemblyYamls)) {
    try {
      const doc = yaml.load(content as string) as any
      if (doc && doc.id) {
        assemblies.push({
          id: doc.id,
          cells: doc.cells || [],
          build: doc.build,
          rawYaml: content as string
        })
      }
    } catch (e) {
      console.warn('Failed to parse assembly', path, e)
    }
  }

  for (const [path, content] of Object.entries(journeyYamlFiles)) {
    try {
      const doc = yaml.load(content as string) as any
      if (doc && doc.id) {
        journeys.push({
          id: doc.id,
          goal: doc.goal || '',
          owner: doc.owner || { team: 'unknown', role: 'unknown' },
          cells: doc.cells || [],
          contracts: doc.contracts || [],
          passCriteria: doc.passCriteria || [],
          rawYaml: content as string
        })
      }
    } catch (e) {
      console.warn('Failed to parse journey', path, e)
    }
  }

  for (const [path, content] of Object.entries(statusBoardYamls)) {
    try {
      const doc = yaml.load(content as string) as any
      if (Array.isArray(doc)) {
        doc.forEach((item: any) => {
          if (item.journeyId) {
            journeyStatuses.push({
              journeyId: item.journeyId,
              state: item.state || 'todo',
              risk: item.risk || 'low',
              blocker: item.blocker || '',
              updatedAt: item.updatedAt || ''
            })
          }
        })
      }
    } catch (e) {
      console.warn('Failed to parse status board', path, e)
    }
  }

  cachedData = {
    cells,
    slices,
    contracts,
    assemblies,
    contractDetails,
    journeys,
    journeyStatuses
  }

  return cachedData
}

export function parseTopology() {
  const data = parseDevtoolsData()
  return {
    cells: data.cells,
    slices: data.slices,
    contracts: data.contracts,
    assemblies: data.assemblies
  }
}
