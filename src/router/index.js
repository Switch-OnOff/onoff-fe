import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/home/HomePage.vue';
import NotFoundPage from '@/pages/home/NotFoundPage.vue';
import authRoutes from './auth.js'
import ChatDetailPage from '@/pages/chat/ChatDetailPage.vue';
import ChatListPage from '@/pages/chat/ChatListPage.vue';

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
  {
    path: '/chat-detail',
    name: 'chat-detail',
    component: ChatDetailPage,
  },
  {
    path: '/chat-list',
    name: 'chat-list',
    component: ChatListPage,
  },
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
