export default [
  {
    path: '/chat-detail/:id',
    name: 'chat-detail',
    component: () => import('@/pages/chat/ChatDetailPage.vue'),
    meta: {
      hideHeader: true,
      hideFooter: true,
    },
  },
  {
    path: '/chat-list',
    name: 'chat-list',
    component: () => import('@/pages/chat/ChatListPage.vue'),
    meta: {
      hideHeader: true,
    },
  },
];
