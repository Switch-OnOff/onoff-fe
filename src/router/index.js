import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/home/HomePage.vue';
import NotFoundPage from '@/pages/home/NotFoundPage.vue';
import authRoutes from './auth.js';
import listingRoutes from './listing.js';
import chatRoutes from './chat.js';
import financialRoutes from './financial';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  ...authRoutes,
  ...listingRoutes,
  ...chatRoutes,
  {
    // 정의되지 않은 모든 경로 처리
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
