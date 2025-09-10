import { createRouter, createWebHistory } from 'vue-router';
import { useFinancialStore } from '@/stores/financial';

import HomePage from '@/pages/home/HomePage.vue';
import NotFoundPage from '@/pages/home/NotFoundPage.vue';
import authRoutes from './auth.js';
import listingRoutes from './listing.js';
import financialRoutes from './financial';
import chatRoutes from './chat.js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  ...authRoutes,
  ...listingRoutes,
  ...chatRoutes,
  ...financialRoutes,
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

router.beforeEach((to) => {
  const supportSteps = new Set([
    'support-basic',
    'support-criteria',
    'support-docs',
  ]);
  const loanSteps = new Set(['loan-basic']);

  if (supportSteps.has(to.name)) {
    const store = useFinancialStore();
    if (store.mode !== 'support') return { name: 'finselect' };
  }
  if (loanSteps.has(to.name)) {
    const store = useFinancialStore();
    if (store.mode !== 'loan') return { name: 'finselect' };
  }
});

export default router;
