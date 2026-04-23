import type { DevtoolsData, GovernanceResult } from '../../shared/types'

export function runGovernanceChecks(data: DevtoolsData): GovernanceResult[] {
  const results: GovernanceResult[] = []

  // 1. Format Rules
  data.cells.forEach(c => {
    if (!c.id) results.push({ ruleId: 'FMT-001', category: 'format', severity: 'error', message: `Cell name is missing`, suggestion: 'Add id field to cell.yaml' })
    if (!c.type) results.push({ ruleId: 'FMT-001', category: 'format', severity: 'error', message: `Cell ${c.id || 'unknown'} type is missing`, file: `cells/${c.id}/cell.yaml`, suggestion: 'Add type field to cell.yaml' })
    if (!c.owner?.team || !c.owner?.role) results.push({ ruleId: 'FMT-001', category: 'format', severity: 'error', message: `Cell ${c.id} owner config is incomplete`, file: `cells/${c.id}/cell.yaml`, suggestion: 'Ensure owner.team and owner.role are set' })
  })

  // 2. Reference Rules
  data.slices.forEach(s => {
    if (s.belongsToCell) {
      if (!data.cells.find(c => c.id === s.belongsToCell)) {
        results.push({ ruleId: 'REF-001', category: 'reference', severity: 'error', message: `Slice ${s.id} references non-existent cell ${s.belongsToCell}`, file: `cells/${s.belongsToCell}/slices/${s.id}/slice.yaml`, suggestion: 'Correct belongsToCell' })
      }
    }
    s.contractUsages.forEach(usage => {
      if (!data.contractDetails.find(c => c.id === usage.contract)) {
        results.push({ ruleId: 'REF-002', category: 'reference', severity: 'error', message: `Slice ${s.id} usages non-existent contract ${usage.contract}`, suggestion: 'Correct contract usage reference' })
      }
    })
  })

  data.assemblies.forEach(a => {
    a.cells.forEach(cellId => {
      if (!data.cells.find(c => c.id === cellId)) {
        results.push({ ruleId: 'REF-003', category: 'reference', severity: 'error', message: `Assembly ${a.id} references non-existent cell ${cellId}`, suggestion: 'Remove invalid cell id from assembly cells list' })
      }
    })
  })

  // 3. Verify Rules
  data.cells.forEach(c => {
    if (!c.verify?.smoke || c.verify.smoke.length === 0) {
      results.push({ ruleId: 'VER-001', category: 'verify', severity: 'warning', message: `Cell ${c.id} has no smoke tests configured`, file: `cells/${c.id}/cell.yaml`, suggestion: 'Add verify.smoke' })
    }
  })

  data.slices.forEach(s => {
    if (!s.verify?.unit || s.verify.unit.length === 0) {
      results.push({ ruleId: 'VER-002', category: 'verify', severity: 'warning', message: `Slice ${s.id} has no unit tests configured`, file: `cells/${s.belongsToCell}/slices/${s.id}/slice.yaml`, suggestion: 'Add verify.unit' })
    }
  })

  // 4. Advisory Rules
  data.cells.forEach(c => {
    const hasSlices = data.slices.some(s => s.belongsToCell === c.id)
    if (!hasSlices) {
      results.push({ ruleId: 'ADV-001', category: 'advisory', severity: 'info', message: `Cell ${c.id} has no slices`, file: `cells/${c.id}/cell.yaml`, suggestion: 'Consider if this cell is necessary or create a slice' })
    }
  })

  data.contractDetails.forEach(c => {
    if (c.usedBy.length === 0) {
      results.push({ ruleId: 'ADV-002', category: 'advisory', severity: 'warning', message: `Contract ${c.id} is an orphan (not served/called by any slice)`, file: `contracts/**/contract.yaml`, suggestion: 'Remove inactive contract or wire it to a slice' })
    }
  })

  return results
}
