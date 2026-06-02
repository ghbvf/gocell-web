/**
 * useRovingTablist — ARIA APG roving tabindex for a horizontal tablist.
 *
 * Handles ArrowRight / ArrowLeft (with wrap) and Home / End.
 * Other keys are ignored (no preventDefault, no focus move).
 *
 * Blinding coverage: does not handle vertical arrow keys (ArrowUp/Down),
 * nor does it update tabindex attributes — that is the caller's responsibility.
 */
export interface RovingTablistOptions {
  /** Returns the ordered list of tab ids (called on every keydown for live lists). */
  tabIds: () => readonly string[]
  /** Maps a tab id to the DOM element id of its button. */
  idFor: (id: string) => string
  /**
   * Optional automatic-activation callback (APG pattern).
   * Called with the target tab id after focus moves on Arrow/Home/End.
   * Keeps roving "home" position in sync with the active tab.
   */
  onActivate?: ((id: string) => void) | undefined
}

export interface RovingTablistReturn {
  onKeydown(e: KeyboardEvent, currentId: string): void
}

export function useRovingTablist(opts: RovingTablistOptions): RovingTablistReturn {
  function onKeydown(e: KeyboardEvent, currentId: string): void {
    const ids = opts.tabIds()
    const current = ids.indexOf(currentId)
    if (current === -1) return

    let target = -1

    switch (e.key) {
      case 'ArrowRight':
        target = (current + 1) % ids.length
        break
      case 'ArrowLeft':
        target = (current - 1 + ids.length) % ids.length
        break
      case 'Home':
        target = 0
        break
      case 'End':
        target = ids.length - 1
        break
      default:
        return
    }

    const targetId = ids[target]
    if (targetId === undefined) return

    e.preventDefault()
    document.getElementById(opts.idFor(targetId))?.focus()
    opts.onActivate?.(targetId)
  }

  return { onKeydown }
}
