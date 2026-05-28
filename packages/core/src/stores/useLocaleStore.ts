import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type AppLocale = 'zh-CN' | 'en-US'

const STORAGE_KEY = 'gocell-locale'
const SUPPORTED_LOCALES: AppLocale[] = ['zh-CN', 'en-US']

function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as string[]).includes(value)
}

function readInitialLocale(): AppLocale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (isAppLocale(stored)) return stored
  return 'zh-CN'
}

/**
 * useLocaleStore — manages application locale state.
 *
 * Persists to localStorage under 'gocell-locale'.
 * Drives vue-i18n locale + AntD ConfigProvider locale via watchers
 * registered by createGocellI18n() / App.vue.
 *
 * Store id: 'core.locale' (point-namespaced to avoid DevTools conflicts)
 */
export const useLocaleStore = defineStore('core.locale', () => {
  const locale = ref<AppLocale>(readInitialLocale())

  function setLocale(next: AppLocale): void {
    if (!isAppLocale(next)) return
    locale.value = next
    localStorage.setItem(STORAGE_KEY, next)
  }

  // Persist any programmatic change (safety net)
  watch(locale, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
  })

  return { locale, setLocale }
})
