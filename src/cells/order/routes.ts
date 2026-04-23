import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/shared/components/AppLayout.vue'

export const orderRoutes: RouteRecordRaw[] = [
  {
    path: '/orders',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'OrderList',
        component: () => import('./slices/order/OrderListPage.vue')
      },
      {
        path: ':id',
        name: 'OrderDetail',
        component: () => import('./slices/order/OrderDetailPage.vue')
      }
    ]
  }
]
