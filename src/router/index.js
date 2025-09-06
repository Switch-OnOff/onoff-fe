import { createRouter, createWebHistory } from 'vue-router';

// 페이지 import
import HomePage from '@/pages/home/HomePage.vue';
import NotFoundPage from '@/pages/home/NotFoundPage.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    // 정의되지 않은 모든 경로 처리
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
  },
  {
    path: '/chat-detail',
    name: 'chat-detail',
    component: ChatDetailPage,
    meta: {
      hideHeader: true,
    },
  },
  {
    path: '/chat-list',
    name: 'chat-list',
    component: ChatListPage,
    meta: {
      hideHeader: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
