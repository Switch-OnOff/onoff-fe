import { createRouter, createWebHistory } from 'vue-router'

// 기본 페이지 import
import HomePage from '@/pages/home/HomePage.vue'
import NotFoundPage from '@/pages/home/NotFoundPage.vue'

// auth 라우트 import
import authRoutes from './auth.js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  ...authRoutes, 
  {
    // 정의되지 않은 모든 경로 처리
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
