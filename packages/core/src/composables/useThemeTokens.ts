import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { theme as antTheme } from 'ant-design-vue'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'
import type { AliasToken } from 'ant-design-vue/es/theme/internal'
import { useTheme } from './useTheme'

/**
 * Read a CSS variable from :root so the browser resolves oklch / relative
 * color syntax to a computed value.
 */
function readCssVar(name: string): string {
  return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function buildSeedTokens(currentTheme: 'light' | 'dark'): Partial<AliasToken> {
  // currentTheme is consumed to ensure computed recalculates on switch
  void currentTheme
  return {
    colorPrimary: readCssVar('--accent'),
    colorSuccess: readCssVar('--ok'),
    colorWarning: readCssVar('--warn'),
    colorError: readCssVar('--err'),
    colorBgBase: readCssVar('--bg'),
    colorTextBase: readCssVar('--fg'),
    colorBorder: readCssVar('--line'),
    fontFamily: readCssVar('--font-sans'),
    borderRadius: 6,
  }
}

// Module-level singleton: share one computed across all callers
const { theme } = useTheme()

const _reactiveConfig: ComputedRef<ThemeConfig> = computed<ThemeConfig>(() => ({
  algorithm: theme.value === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  token: buildSeedTokens(theme.value),
}))

export function useThemeTokens(): {
  themeConfig: ComputedRef<ThemeConfig>
} {
  return {
    themeConfig: _reactiveConfig,
  }
}
