import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Batch 0 骨架路由。
// login + first-run-setup 路由是守卫重定向的必要目标，占位组件供 Batch 0 使用。
// PR-07/08 将替换为真正的 LoginView / FirstRunView。
const PlaceholderView = { template: '<div />' }

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: false },
  },
  {
    // TODO(PR-07): 替换为真正的 LoginView
    path: '/login',
    name: 'login',
    component: PlaceholderView,
    meta: { requiresAuth: false, public: true },
  },
  {
    // TODO(PR-08): 替换为真正的 FirstRunSetupView
    path: '/first-run-setup',
    name: 'first-run-setup',
    component: PlaceholderView,
    meta: { requiresAuth: false, public: true },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
