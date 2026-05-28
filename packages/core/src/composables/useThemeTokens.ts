import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { theme as antTheme } from 'ant-design-vue'
import type { ConfigProviderProps } from 'ant-design-vue'
import { useTheme } from './useTheme'

/**
 * ThemeConfig derived from AntD's publicly exported ConfigProviderProps.
 * This avoids importing from internal AntD paths (es/config-provider/context).
 */
export type ThemeConfig = NonNullable<ConfigProviderProps['theme']>

/**
 * Read a single CSS variable from :root.
 * Returns undefined when the variable is missing (empty string from getPropertyValue)
 * so AntD ignores the field rather than receiving an empty string.
 */
function readCssVar(style: CSSStyleDeclaration, name: string): string | undefined {
  const value = style.getPropertyValue(name).trim()
  return value !== '' ? value : undefined
}

/**
 * Build the partial seed token override by reading CSS variables once.
 * Accepts the current theme string so the computed ref invalidates on theme change.
 */
function buildSeedTokens(currentTheme: 'light' | 'dark'): ThemeConfig['token'] {
  // currentTheme consumed to ensure computed recalculates on switch
  void currentTheme

  // Single getComputedStyle call → one style-flush for all 8 variables
  const style = window.getComputedStyle(document.documentElement)

  const accent = readCssVar(style, '--accent')
  const ok = readCssVar(style, '--ok')
  const warn = readCssVar(style, '--warn')
  const err = readCssVar(style, '--err')
  const bg = readCssVar(style, '--bg')
  const fg = readCssVar(style, '--fg')
  const line = readCssVar(style, '--line')
  const fontSans = readCssVar(style, '--font-sans')

  // Only include defined values so AntD's Partial<AliasToken> receives no
  // explicit undefined (required by exactOptionalPropertyTypes)
  return {
    borderRadius: 6,
    ...(accent !== undefined && { colorPrimary: accent }),
    ...(ok !== undefined && { colorSuccess: ok }),
    ...(warn !== undefined && { colorWarning: warn }),
    ...(err !== undefined && { colorError: err }),
    ...(bg !== undefined && { colorBgBase: bg }),
    ...(fg !== undefined && { colorTextBase: fg }),
    ...(line !== undefined && { colorBorder: line }),
    ...(fontSans !== undefined && { fontFamily: fontSans }),
  }
}

// Lazy singleton: created on first useThemeTokens() call so Pinia has time to
// be initialized (avoids "getActivePinia() was called but no active Pinia" error
// when this module is imported before app.use(pinia) runs).
let _reactiveConfig: ComputedRef<ThemeConfig> | null = null

export function useThemeTokens(): {
  themeConfig: ComputedRef<ThemeConfig>
} {
  if (_reactiveConfig === null) {
    const { theme } = useTheme()
    _reactiveConfig = computed<ThemeConfig>(() => {
      // Cast required: exactOptionalPropertyTypes on AntD's ThemeConfig makes
      // the optional-with-undefined pattern strict; we always return a defined
      // token object so the assertion is safe.
      return {
        algorithm: theme.value === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: buildSeedTokens(theme.value),
      } as ThemeConfig
    })
  }
  return {
    themeConfig: _reactiveConfig,
  }
}
