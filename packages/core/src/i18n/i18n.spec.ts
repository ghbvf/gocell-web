import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createGocellI18n, syncI18nLocale } from './index'
import { useLocaleStore } from '../stores/useLocaleStore'
import zhCN from './messages/zh-CN'
import enUS from './messages/en-US'

/** Cast i18n to composition-mode accessor to avoid the over-wide ReturnType<typeof createI18n> */
function asComposer(i18n: ReturnType<typeof createI18n>) {
  return i18n.global as { locale: { value: string }; t: (key: string) => string }
}

const STORAGE_KEY = 'gocell-locale'

describe('createGocellI18n', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('creates an i18n instance', () => {
    const i18n = createGocellI18n()
    expect(i18n).toBeDefined()
    expect(i18n.global).toBeDefined()
  })

  it('defaults to zh-CN when localStorage is empty', () => {
    const i18n = createGocellI18n()
    expect(asComposer(i18n).locale.value).toBe('zh-CN')
  })

  it('reads initial locale from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'en-US')
    const i18n = createGocellI18n()
    expect(asComposer(i18n).locale.value).toBe('en-US')
  })

  it('falls back to zh-CN for unknown stored locale', () => {
    localStorage.setItem(STORAGE_KEY, 'de-DE')
    const i18n = createGocellI18n()
    expect(asComposer(i18n).locale.value).toBe('zh-CN')
  })

  it('accepts en-US from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'en-US')
    const i18n = createGocellI18n()
    expect(asComposer(i18n).locale.value).toBe('en-US')
  })

  it('falls back to zh-CN when localStorage is empty string', () => {
    localStorage.setItem(STORAGE_KEY, '')
    const i18n = createGocellI18n()
    expect(asComposer(i18n).locale.value).toBe('zh-CN')
  })

  it('has composition API mode (legacy: false)', () => {
    const i18n = createGocellI18n()
    // In non-legacy mode, global.locale is a WritableComputedRef (has .value)
    expect(typeof asComposer(i18n).locale.value).toBe('string')
  })
})

describe('zh-CN messages', () => {
  it('has errors.unknown key', () => {
    expect(zhCN.errors.unknown).toBeTruthy()
  })

  it('has errors.network key', () => {
    expect(zhCN.errors.network).toBeTruthy()
  })

  it('has errors.ERR_AUTH_LOGIN_FAILED key', () => {
    expect(zhCN.errors.ERR_AUTH_LOGIN_FAILED).toBeTruthy()
  })

  it('has errors.ERR_VERSION_CONFLICT key', () => {
    expect(zhCN.errors.ERR_VERSION_CONFLICT).toBeTruthy()
  })

  it('has errors.ERR_VALIDATION key', () => {
    expect(zhCN.errors.ERR_VALIDATION).toBeTruthy()
  })

  it('has all 5 nav group labels', () => {
    expect(zhCN.nav.group.meta).toBeTruthy()
    expect(zhCN.nav.group.plan).toBeTruthy()
    expect(zhCN.nav.group.build).toBeTruthy()
    expect(zhCN.nav.group.access).toBeTruthy()
    expect(zhCN.nav.group.operate).toBeTruthy()
  })

  it('has shell.brand key', () => {
    expect(zhCN.shell.brand).toBe('gocell')
  })

  it('has command.placeholder key', () => {
    expect(zhCN.command.placeholder).toBeTruthy()
  })
})

describe('en-US messages', () => {
  it('has errors.unknown key', () => {
    expect(enUS.errors.unknown).toBeTruthy()
  })

  it('has errors.network key', () => {
    expect(enUS.errors.network).toBeTruthy()
  })

  it('has errors.ERR_AUTH_LOGIN_FAILED key', () => {
    expect(enUS.errors.ERR_AUTH_LOGIN_FAILED).toBeTruthy()
  })

  it('has same top-level keys as zh-CN', () => {
    const zhKeys = Object.keys(zhCN).sort()
    const enKeys = Object.keys(enUS).sort()
    expect(enKeys).toEqual(zhKeys)
  })

  it('has same nav keys as zh-CN', () => {
    const zhNavKeys = Object.keys(zhCN.nav).sort()
    const enNavKeys = Object.keys(enUS.nav).sort()
    expect(enNavKeys).toEqual(zhNavKeys)
  })

  it('has same errors keys as zh-CN', () => {
    const zhErrKeys = Object.keys(zhCN.errors).sort()
    const enErrKeys = Object.keys(enUS.errors).sort()
    expect(enErrKeys).toEqual(zhErrKeys)
  })

  it('has shell.brand key', () => {
    expect(enUS.shell.brand).toBe('gocell')
  })
})

describe('syncI18nLocale', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('syncs i18n locale from store initial value', () => {
    localStorage.setItem('gocell-locale', 'en-US')
    const i18n = createGocellI18n()
    const localeStore = useLocaleStore()
    syncI18nLocale(i18n, localeStore)
    expect(asComposer(i18n).locale.value).toBe('en-US')
  })

  it('updates i18n locale when store locale changes', async () => {
    const i18n = createGocellI18n()
    const localeStore = useLocaleStore()
    syncI18nLocale(i18n, localeStore)

    localeStore.setLocale('en-US')
    // Vue watch is flushed async; await nextTick for propagation
    await nextTick()
    expect(asComposer(i18n).locale.value).toBe('en-US')
  })
})

describe('locale switching', () => {
  it('zh-CN → en-US: t(errors.unknown) changes', () => {
    const i18n = createGocellI18n()
    const composer = asComposer(i18n)
    const t = composer.t

    composer.locale.value = 'zh-CN'
    const zhText = t('errors.unknown')

    composer.locale.value = 'en-US'
    const enText = t('errors.unknown')

    expect(zhText).not.toBe(enText)
    expect(zhText).toBeTruthy()
    expect(enText).toBeTruthy()
  })
})
