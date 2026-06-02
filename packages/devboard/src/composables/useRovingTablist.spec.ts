import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRovingTablist } from './useRovingTablist'

const TAB_IDS = ['overview', 'interfaces', 'wiring'] as const

describe('useRovingTablist', () => {
  let focusMock: ReturnType<typeof vi.fn>
  let mockEl: { focus: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    focusMock = vi.fn()
    mockEl = { focus: focusMock }
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      if (id.includes('overview') || id.includes('interfaces') || id.includes('wiring')) {
        return mockEl as unknown as HTMLElement
      }
      return null
    })
  })

  const makeRoving = () =>
    useRovingTablist({
      tabIds: () => TAB_IDS,
      idFor: (id) => `cell-tab-test-${id}`,
    })

  const makeKeyEvent = (key: string): KeyboardEvent =>
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })

  it('ArrowRight moves focus from first to second tab', () => {
    const { onKeydown } = makeRoving()
    const e = makeKeyEvent('ArrowRight')
    const preventSpy = vi.spyOn(e, 'preventDefault')
    onKeydown(e, 'overview')
    expect(preventSpy).toHaveBeenCalled()
    expect(document.getElementById).toHaveBeenCalledWith('cell-tab-test-interfaces')
    expect(focusMock).toHaveBeenCalled()
  })

  it('ArrowRight from last tab wraps to first', () => {
    const { onKeydown } = makeRoving()
    const e = makeKeyEvent('ArrowRight')
    const preventSpy = vi.spyOn(e, 'preventDefault')
    onKeydown(e, 'wiring')
    expect(preventSpy).toHaveBeenCalled()
    expect(document.getElementById).toHaveBeenCalledWith('cell-tab-test-overview')
    expect(focusMock).toHaveBeenCalled()
  })

  it('ArrowLeft moves focus from last to second tab', () => {
    const { onKeydown } = makeRoving()
    const e = makeKeyEvent('ArrowLeft')
    const preventSpy = vi.spyOn(e, 'preventDefault')
    onKeydown(e, 'wiring')
    expect(preventSpy).toHaveBeenCalled()
    expect(document.getElementById).toHaveBeenCalledWith('cell-tab-test-interfaces')
    expect(focusMock).toHaveBeenCalled()
  })

  it('ArrowLeft from first tab wraps to last', () => {
    const { onKeydown } = makeRoving()
    const e = makeKeyEvent('ArrowLeft')
    const preventSpy = vi.spyOn(e, 'preventDefault')
    onKeydown(e, 'overview')
    expect(preventSpy).toHaveBeenCalled()
    expect(document.getElementById).toHaveBeenCalledWith('cell-tab-test-wiring')
    expect(focusMock).toHaveBeenCalled()
  })

  it('Home jumps to first tab', () => {
    const { onKeydown } = makeRoving()
    const e = makeKeyEvent('Home')
    const preventSpy = vi.spyOn(e, 'preventDefault')
    onKeydown(e, 'wiring')
    expect(preventSpy).toHaveBeenCalled()
    expect(document.getElementById).toHaveBeenCalledWith('cell-tab-test-overview')
    expect(focusMock).toHaveBeenCalled()
  })

  it('End jumps to last tab', () => {
    const { onKeydown } = makeRoving()
    const e = makeKeyEvent('End')
    const preventSpy = vi.spyOn(e, 'preventDefault')
    onKeydown(e, 'overview')
    expect(preventSpy).toHaveBeenCalled()
    expect(document.getElementById).toHaveBeenCalledWith('cell-tab-test-wiring')
    expect(focusMock).toHaveBeenCalled()
  })

  it('unrelated key does not call preventDefault and does not move focus', () => {
    const { onKeydown } = makeRoving()
    const e = makeKeyEvent('Tab')
    const preventSpy = vi.spyOn(e, 'preventDefault')
    onKeydown(e, 'overview')
    expect(preventSpy).not.toHaveBeenCalled()
    expect(focusMock).not.toHaveBeenCalled()
  })

  it('Enter key does not call preventDefault and does not move focus', () => {
    const { onKeydown } = makeRoving()
    const e = makeKeyEvent('Enter')
    const preventSpy = vi.spyOn(e, 'preventDefault')
    onKeydown(e, 'overview')
    expect(preventSpy).not.toHaveBeenCalled()
    expect(focusMock).not.toHaveBeenCalled()
  })
})
