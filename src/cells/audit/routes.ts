import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/shared/components/AppLayout.vue'

export const auditRoutes: RouteRecordRaw[] = [
  {
    path: '/audit',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'logs',
        name: 'AuditLogs',
        component: () => import('./slices/audit-log/AuditLogPage.vue')
      }
    ]
  }
]
