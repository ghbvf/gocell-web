import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

// 首次读取 localStorage 的语言配置
const savedLang = localStorage.getItem('gocell-lang') || 'zh-CN'

const i18n = createI18n({
  legacy: false, // For Vue 3 Composition API
  locale: savedLang,
  fallbackLocale: 'en-US',
  messages,
})

export default i18n
