import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import zhCN from './messages/zh-CN'
import enUS from './messages/en-US'
import type { MessageSchema } from './messages/zh-CN'
import { useLocaleStore } from '../stores/useLocaleStore'
import type { AppLocale } from '../stores/useLocaleStore'

export type { MessageSchema }
export type { AppLocale }

/**
 * createGocellI18n — vue-i18n 11 factory for the gocell web app.
 *
 * - Composition API mode (legacy: false)
 * - Initial locale read from useLocaleStore (which reads localStorage)
 * - Fallback locale: zh-CN
 * - Messages bundled at build time (framework keys only; business keys added per batch)
 *
 * Usage in apps/web/main.ts:
 *   app.use(createGocellI18n())
 *
 * The store watcher in App.vue keeps vue-i18n locale in sync when
 * useLocaleStore.setLocale() is called.
 */
export function createGocellI18n(): ReturnType<typeof createI18n> {
  // Read the persisted locale without a Pinia context requirement.
  // The store will be used reactively in App.vue; here we just need the initial string.
  const STORAGE_KEY = 'gocell-locale'
  const stored = localStorage.getItem(STORAGE_KEY)
  const initialLocale: AppLocale =
    stored === 'zh-CN' || stored === 'en-US' ? stored : 'zh-CN'

  return createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: 'zh-CN',
    messages: {
      'zh-CN': zhCN as unknown as MessageSchema,
      'en-US': enUS as unknown as MessageSchema,
    },
    // Silence "Not found" warnings for business keys not yet translated in en-US
    missingWarn: false,
    fallbackWarn: false,
  })
}

/**
 * syncI18nLocale — wire a vue-i18n instance to the locale store.
 *
 * Call this in App.vue after both app.use(i18n) and app.use(pinia) are active:
 *
 *   const i18n = useI18n()       // from createGocellI18n()
 *   const localeStore = useLocaleStore()
 *   syncI18nLocale(i18n, localeStore)
 *
 * This keeps vue-i18n locale reactive to store changes.
 */
export function syncI18nLocale(
  i18n: ReturnType<typeof createI18n>,
  localeStore: ReturnType<typeof useLocaleStore>,
): void {
  // In composition mode (legacy:false), global.locale is a WritableComputedRef<string>.
  // We cast to avoid the complex generic inferred type of createI18n().
  const globalLocale = (i18n.global as { locale: { value: string } }).locale

  // Set initial value immediately
  globalLocale.value = localeStore.locale

  // Watch the store's reactive locale ref and propagate changes to vue-i18n.
  // Using Vue's `watch` because Pinia setup-store mutations go through Vue reactivity,
  // not through Pinia's $patch system that drives $subscribe.
  watch(
    () => localeStore.locale,
    (next) => {
      globalLocale.value = next
    },
    { immediate: false },
  )
}
