import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme as themeAlgorithm } from 'ant-design-vue'

// Helper: mock getComputedStyle to return fixed rgb values for CSS variables
const setupGetComputedStyle = (vars: Record<string, string>) => {
  const original = window.getComputedStyle.bind(window)
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element, pseudo?: string | null) => {
    const realStyle = original(el, pseudo ?? undefined)
    return new Proxy(realStyle, {
      get(target, prop) {
        if (prop === 'getPropertyValue') {
          return (name: string) => vars[name.trim()] ?? ''
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = (target as any)[prop]
        if (typeof val === 'function') return val.bind(target)
        return val
      },
    })
  })
}

describe('useThemeTokens', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    document.documentElement.removeAttribute('data-theme')
    localStorage.clear()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('token mapping', () => {
    it('maps CSS variables to AntD seed tokens correctly', async () => {
      setupGetComputedStyle({
        '--accent': 'rgb(59, 130, 246)',
        '--ok': 'rgb(34, 197, 94)',
        '--warn': 'rgb(234, 179, 8)',
        '--err': 'rgb(239, 68, 68)',
        '--bg': 'rgb(254, 254, 255)',
        '--bg-raised': 'rgb(255, 255, 255)',
        '--fg': 'rgb(15, 15, 20)',
        '--line': 'rgb(230, 232, 240)',
        '--font-sans': '"Geist", system-ui',
      })

      const mod = await import('../useThemeTokens')
      const { themeConfig } = mod.useThemeTokens()

      expect(themeConfig.value.token?.colorPrimary).toContain('rgb')
      expect(themeConfig.value.token?.colorSuccess).toContain('rgb')
      expect(themeConfig.value.token?.colorWarning).toContain('rgb')
      expect(themeConfig.value.token?.colorError).toContain('rgb')
      expect(themeConfig.value.token?.borderRadius).toBe(6)
    })

    it('sets colorPrimary from --accent', async () => {
      setupGetComputedStyle({
        '--accent': 'rgb(59, 130, 246)',
        '--ok': 'rgb(34, 197, 94)',
        '--warn': 'rgb(234, 179, 8)',
        '--err': 'rgb(239, 68, 68)',
        '--bg': 'rgb(254, 254, 255)',
        '--bg-raised': 'rgb(255, 255, 255)',
        '--fg': 'rgb(15, 15, 20)',
        '--line': 'rgb(230, 232, 240)',
        '--font-sans': '"Geist", system-ui',
      })

      const mod = await import('../useThemeTokens')
      const { themeConfig } = mod.useThemeTokens()

      expect(themeConfig.value.token?.colorPrimary).toBe('rgb(59, 130, 246)')
    })

    it('sets borderRadius to 6', async () => {
      setupGetComputedStyle({
        '--accent': 'rgb(0, 0, 255)',
        '--ok': 'rgb(0, 255, 0)',
        '--warn': 'rgb(255, 165, 0)',
        '--err': 'rgb(255, 0, 0)',
        '--bg': 'rgb(255, 255, 255)',
        '--bg-raised': 'rgb(255, 255, 255)',
        '--fg': 'rgb(0, 0, 0)',
        '--line': 'rgb(200, 200, 200)',
        '--font-sans': 'sans-serif',
      })

      const mod = await import('../useThemeTokens')
      const { themeConfig } = mod.useThemeTokens()
      expect(themeConfig.value.token?.borderRadius).toBe(6)
    })
  })

  describe('algorithm switching', () => {
    it('uses defaultAlgorithm for light theme', async () => {
      localStorage.setItem('gocell-theme', 'light')

      setupGetComputedStyle({
        '--accent': 'rgb(59, 130, 246)',
        '--ok': 'rgb(34, 197, 94)',
        '--warn': 'rgb(234, 179, 8)',
        '--err': 'rgb(239, 68, 68)',
        '--bg': 'rgb(254, 254, 255)',
        '--bg-raised': 'rgb(255, 255, 255)',
        '--fg': 'rgb(15, 15, 20)',
        '--line': 'rgb(230, 232, 240)',
        '--font-sans': '"Geist", system-ui',
      })

      const mod = await import('../useThemeTokens')
      const { themeConfig } = mod.useThemeTokens()

      expect(themeConfig.value.algorithm).toBe(themeAlgorithm.defaultAlgorithm)
    })

    it('uses darkAlgorithm for dark theme', async () => {
      localStorage.setItem('gocell-theme', 'dark')

      setupGetComputedStyle({
        '--accent': 'rgb(100, 160, 255)',
        '--ok': 'rgb(34, 197, 94)',
        '--warn': 'rgb(234, 179, 8)',
        '--err': 'rgb(239, 68, 68)',
        '--bg': 'rgb(20, 20, 30)',
        '--bg-raised': 'rgb(30, 30, 40)',
        '--fg': 'rgb(240, 240, 245)',
        '--line': 'rgb(60, 62, 80)',
        '--font-sans': '"Geist", system-ui',
      })

      const mod = await import('../useThemeTokens')
      const { themeConfig } = mod.useThemeTokens()

      expect(themeConfig.value.algorithm).toBe(themeAlgorithm.darkAlgorithm)
    })

    it('switches algorithm when theme changes', async () => {
      localStorage.setItem('gocell-theme', 'light')

      setupGetComputedStyle({
        '--accent': 'rgb(59, 130, 246)',
        '--ok': 'rgb(34, 197, 94)',
        '--warn': 'rgb(234, 179, 8)',
        '--err': 'rgb(239, 68, 68)',
        '--bg': 'rgb(254, 254, 255)',
        '--bg-raised': 'rgb(255, 255, 255)',
        '--fg': 'rgb(15, 15, 20)',
        '--line': 'rgb(230, 232, 240)',
        '--font-sans': '"Geist", system-ui',
      })

      const themeModule = await import('../useTheme')
      const mod = await import('../useThemeTokens')
      const { themeConfig } = mod.useThemeTokens()
      const { setTheme } = themeModule.useTheme()

      expect(themeConfig.value.algorithm).toBe(themeAlgorithm.defaultAlgorithm)

      setTheme('dark')

      expect(themeConfig.value.algorithm).toBe(themeAlgorithm.darkAlgorithm)
    })
  })

  describe('shared singleton', () => {
    it('returns same themeConfig ref across calls', async () => {
      setupGetComputedStyle({
        '--accent': 'rgb(59, 130, 246)',
        '--ok': 'rgb(34, 197, 94)',
        '--warn': 'rgb(234, 179, 8)',
        '--err': 'rgb(239, 68, 68)',
        '--bg': 'rgb(254, 254, 255)',
        '--bg-raised': 'rgb(255, 255, 255)',
        '--fg': 'rgb(15, 15, 20)',
        '--line': 'rgb(230, 232, 240)',
        '--font-sans': '"Geist", system-ui',
      })

      const mod = await import('../useThemeTokens')
      const a = mod.useThemeTokens()
      const b = mod.useThemeTokens()
      expect(a.themeConfig).toBe(b.themeConfig)
    })
  })
})
