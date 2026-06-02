import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CELL_MANIFEST } from '../manifest/cells.generated'
import type { CellEntry } from '../manifest/types'

/**
 * devboard.cells — cell manifest query state.
 *
 * Wraps the static CELL_MANIFEST (build-time derived from cell.yaml files)
 * with reactive selection state for the Cells detail panel.
 */
export const useCellsStore = defineStore('devboard.cells', () => {
  // ─── state ──────────────────────────────────────────────────────────────
  const selectedId = ref<string | null>(null)

  // ─── getters ────────────────────────────────────────────────────────────

  /** All cells from the manifest, sorted by id (as generated). */
  const cells = computed(() => CELL_MANIFEST.cells)

  /**
   * Look up a cell by id. Returns null if not found.
   * Exposed as a function rather than a computed map to allow
   * per-call usage without requiring the caller to unwrap a ref.
   */
  function byId(id: string): CellEntry | null {
    return CELL_MANIFEST.byId[id] ?? null
  }

  /** The currently selected cell, or null if none selected. */
  const selectedCell = computed<CellEntry | null>(() => {
    if (selectedId.value === null) return null
    return CELL_MANIFEST.byId[selectedId.value] ?? null
  })

  // ─── actions ────────────────────────────────────────────────────────────

  function selectCell(id: string | null): void {
    selectedId.value = id
  }

  return {
    // state
    selectedId,
    // getters
    cells,
    byId,
    selectedCell,
    // actions
    selectCell,
  }
})
