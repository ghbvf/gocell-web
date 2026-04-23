import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/shared/components/AppLayout.vue'

export const configRoutes: RouteRecordRaw[] = [
  {
    path: '/config',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'entries',
        name: 'ConfigManage',
        component: () => import('./slices/config-manage/ConfigListPage.vue')
      },
      {
        path: 'flags',
        name: 'FeatureFlag',
        component: () => import('./slices/feature-flag/FeatureFlagPage.vue')
      }
    ]
  }
]
