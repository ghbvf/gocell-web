import { createRouter, createWebHistory } from 'vue-router'
import { accessRoutes } from '@/cells/access/routes'
import { auditRoutes } from '@/cells/audit/routes'
import { configRoutes } from '@/cells/config/routes'
import { dashboardRoutes } from '@/cells/dashboard/routes'
import { orderRoutes } from '@/cells/order/routes'
import { deviceRoutes } from '@/cells/device/routes'
import { devtoolsRoutes } from '@/cells/devtools/routes'
import { useAuthStore } from '@/shared/stores/auth'

const routes = [
  ...accessRoutes,
  ...auditRoutes,
  ...configRoutes,
  ...orderRoutes,
  ...deviceRoutes,
  ...devtoolsRoutes,
  ...dashboardRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ path: '/' })
  } else {
    next()
  }
})

export default router
