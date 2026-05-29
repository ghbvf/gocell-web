import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Layout fork is structural, not a meta flag (AI-HARD): standalone full-screen
// auth pages are top-level routes rendered directly in App.vue's <RouterView/>;
// every in-shell page is a child of AppShellLayout and inherits the chrome.
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    // Per-view subpath imports → each view is its own async chunk (visiting
    // /login must not also pull the first-run wizard).
    component: () => import('@gocell/access/views/login'),
    meta: { requiresAuth: false, public: true },
  },
  {
    path: '/first-run-setup',
    name: 'first-run-setup',
    component: () => import('@gocell/access/views/first-run'),
    meta: { requiresAuth: false, public: true },
  },
  {
    path: '/',
    component: () => import('../layouts/AppShellLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
        // TODO(Batch 7): Health Overview 需认证，改 requiresAuth: true
        meta: { requiresAuth: false },
      },
      {
        // Access · Identities (Batch 2). PR-09 ships the read-only list behind
        // the auth gate; PR-10 adds meta.requiredAction (PDP fail-closed gate)
        // once the operation modals + <Can> land. Own async chunk via subpath.
        path: 'access/identities',
        name: 'access-identities',
        component: () => import('@gocell/access/views/identities'),
        meta: { requiresAuth: true },
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // SPA 路由切换时滚动到顶部（a11y：确保新视图从顶部开始）
  scrollBehavior: () => ({ top: 0 }),
})
