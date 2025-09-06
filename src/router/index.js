import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/MapView.vue'),
    },
    {
      path: '/chatting',
      name: 'chatting',
      component: () => import('../views/ChattingView.vue'),
    },
    {
      path: '/loan',
      name: 'loan',
      component: () => import('../views/LoanView.vue'),
    },
    {
      path: '/my-page',
      name: 'myPage',
      component: () => import('../views/MyPageView.vue'),
    },
  ],
});

export default router;
