import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/shared/components/AppLayout.vue'

export const devtoolsRoutes: RouteRecordRaw[] = [
  {
    path: '/devtools',
    component: AppLayout,
    meta: { requiresAuth: true }, // or true if they must login
    children: [
      {
        path: 'topology',
        name: 'ArchTopology',
        component: () => import('./slices/arch-topology/ArchTopologyPage.vue')
      },
      {
        path: 'contracts',
        name: 'ContractExplorer',
        component: () => import('./slices/contract-explorer/ContractExplorerPage.vue')
      },
      {
        path: 'journeys',
        name: 'JourneyBoard',
        component: () => import('./slices/journey-board/JourneyBoardPage.vue')
      },
      {
        path: 'governance',
        name: 'GovernanceReport',
        component: () => import('./slices/governance-report/GovernanceReportPage.vue')
      },
      {
        path: 'consistency',
        name: 'ConsistencyDemo',
        component: () => import('./slices/consistency-demo/ConsistencyDemoPage.vue')
      },
      {
        path: 'event-flow',
        name: 'EventFlow',
        component: () => import('./slices/event-flow/EventFlowPage.vue')
      },
      {
        path: 'outbox',
        name: 'OutboxMonitor',
        component: () => import('./slices/outbox-monitor/OutboxMonitorPage.vue')
      }
    ]
  }
]
