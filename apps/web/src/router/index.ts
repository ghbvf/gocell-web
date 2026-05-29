import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 骨架阶段仅一条占位路由；业务路由在各 batch 由对应 @gocell/* 包的 routes.ts 聚合注入。
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
