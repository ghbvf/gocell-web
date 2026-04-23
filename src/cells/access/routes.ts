import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/shared/components/AppLayout.vue'

export const accessRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./slices/session/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/access',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'users',
        name: 'UserManage',
        component: () => import('./slices/user-manage/UserListPage.vue')
      },
      {
        path: 'rbac',
        name: 'Rbac',
        component: () => import('./slices/rbac/RbacPage.vue')
      }
    ]
  }
]
