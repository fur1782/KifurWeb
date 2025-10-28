import type { RouteRecordRaw } from 'vue-router'

export const studentRoutes: RouteRecordRaw = {
  path: '/join',
  name: 'join',
  component: () => import('@/modules/student/views/StudentJoinView.vue'),
}
