import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/shared/components/AppLayout.vue'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('./slices/health-overview/HealthOverviewPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]
