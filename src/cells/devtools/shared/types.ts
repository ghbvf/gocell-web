// ─── 基础类型（原 arch-topology/types.ts 提升） ────────────────────────

export interface CellMeta {
  id: string
  type: string
  consistencyLevel?: string
  owner?: { team: string; role: string }
  schema?: { primary: string }
  verify?: { smoke?: string[] }
  l0Dependencies?: string[]
  rawYaml: string
}

export interface SliceMeta {
  id: string
  belongsToCell: string
  contractUsages: { contract: string; role: string }[]
  verify?: {
    unit?: string[]
    contract?: string[]
    waivers?: { contract: string; owner: string; reason: string; expiresAt?: string }[]
  }
  rawYaml: string
}

export interface ContractMeta {
  id: string
  kind: string
  ownerCell: string
  rawYaml: string
}

export interface AssemblyMeta {
  id: string
  cells: string[]
  build?: { entrypoint: string; binary: string; deployTemplate: string }
  rawYaml: string
}

export interface TopologyData {
  cells: CellMeta[]
  slices: SliceMeta[]
  contracts: ContractMeta[]
  assemblies: AssemblyMeta[]
}

// ─── Contract Explorer 扩展类型 ────────────────────────────────────────

export interface ContractDetail extends ContractMeta {
  consistencyLevel?: string
  lifecycle?: string
  endpoints?: {
    server: string
    clients?: string[]
    http?: { method: string; path: string; successStatus: number; noContent?: boolean }
  }
  schemaRefs?: { request: string; response: string }
  /** 交叉引用：哪些 Slice 使用了这个 Contract */
  usedBy: { sliceId: string; cellId: string; role: string }[]
}

// ─── Journey 类型 ─────────────────────────────────────────────────────

export interface JourneyPassCriteria {
  text: string
  mode: 'auto' | 'manual'
  checkRef?: string
}

export interface JourneyMeta {
  id: string
  goal: string
  owner: { team: string; role: string }
  cells: string[]
  contracts: string[]
  passCriteria: JourneyPassCriteria[]
  rawYaml: string
}

export interface JourneyStatus {
  journeyId: string
  state: 'todo' | 'doing' | 'done'
  risk: string
  blocker: string
  updatedAt: string
}

// ─── Governance 类型 ──────────────────────────────────────────────────

export type GovernanceCategory = 'format' | 'reference' | 'verify' | 'advisory'
export type GovernanceSeverity = 'error' | 'warning' | 'info'

export interface GovernanceResult {
  ruleId: string
  category: GovernanceCategory
  severity: GovernanceSeverity
  message: string
  file?: string
  suggestion?: string
}

// ─── 完整解析数据（扩展 TopologyData） ────────────────────────────────

export interface DevtoolsData extends TopologyData {
  contractDetails: ContractDetail[]
  journeys: JourneyMeta[]
  journeyStatuses: JourneyStatus[]
}
