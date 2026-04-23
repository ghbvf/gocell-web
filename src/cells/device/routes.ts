import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/shared/components/AppLayout.vue'

export const deviceRoutes: RouteRecordRaw[] = [
  {
    path: '/devices',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DeviceList',
        component: () => import('./slices/device-manage/DeviceListPage.vue')
      },
      {
        path: ':id/commands',
        name: 'DeviceCommand',
        component: () => import('./slices/device-command/DeviceCommandPage.vue')
      }
    ]
  }
]
