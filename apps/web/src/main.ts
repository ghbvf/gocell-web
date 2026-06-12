import 'ant-design-vue/dist/reset.css'
import '@gocell/core/styles/tokens.css'
import '@gocell/core/styles/v1-linear.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { message } from 'ant-design-vue'
import App from './App.vue'
import { router } from './router'
import { createGocellI18n, PDP_INJECTION_KEY } from '@gocell/core'
import { createPdpClient } from '@gocell/access'
import { configureAxios, bootstrapSession } from './bootstrap'
import { registerGuards } from './router/guards'

const app = createApp(App)

// 1. Pinia first — authStore depends on it
app.use(createPinia())

// 2. Axios: auth callbacks wired to authStore
configureAxios(router)

// 3. i18n + router (capture i18n so the route guard can localise deny reasons)
const i18n = createGocellI18n()
app.use(i18n)
app.use(router)

// 4. PDP client provided for Can / useDecision in the whole app
const pdpClient = createPdpClient()
app.provide(PDP_INJECTION_KEY, pdpClient)

// 5. Route guards (three-stage: first-run → auth → PDP).
//    PDP deny → localised warning toast. The translate fn is cast through a
//    minimal signature because createGocellI18n's broad return type leaves
//    i18n.global.t as a union of overloads (assembly-layer adapter only).
const translate = i18n.global.t as unknown as (key: string) => string
registerGuards(router, app, pdpClient, (reasonCode: string) => {
  message.warning(translate(`access.pdp.deny.${reasonCode}`))
})

// 6. Attempt silent session restore before the first navigation, then mount.
//    No-op on a cold load until the backend ships a refresh cookie (#12 H2).
void bootstrapSession().finally(() => app.mount('#app'))
