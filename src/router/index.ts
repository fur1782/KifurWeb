import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/modules/home/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Home
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    // Student Routes
    {
      path: '/join',
      name: 'join',
      component: () => import('@/modules/student/views/StudentJoinView.vue'),
    },
    {
      path: '/play/:roomId',
      name: 'student-play',
      component: () => import('@/modules/student/views/StudentPlayView.vue'),
      props: true,
    },

    // Teacher Routes
    {
      path: '/create',
      name: 'create',
      component: () => import('@/views/CreateView.vue'),
    },
    {
      path: '/session/:roomId',
      name: 'teacher-session',
      component: () => import('@/modules/teacher/views/TeacherSessionView.vue'),
      props: true,
    },
    {
      path: '/dashboard',
      name: 'teacher-dashboard',
      component: () => import('@/modules/teacher/views/TeacherDashboardView.vue'),
      props: true,
    },

    // Common Routes
    {
      path: '/resultat/:roomId',
      name: 'result',
      component: () => import('@/modules/common/views/ResultView.vue'),
      props: true,
    },

    // Other
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
  ],
})

export default router
