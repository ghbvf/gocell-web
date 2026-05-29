import 'ant-design-vue/dist/reset.css'
import '@gocell/core/styles/tokens.css'
import '@gocell/core/styles/v1-linear.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
