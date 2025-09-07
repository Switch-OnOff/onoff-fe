export default [
  {
    path: '/listing',
    name: 'listing-list',
    component: () => import('@/pages/listing/ListingsPage.vue'),
    meta: {
      hideHeader: true,    // Header 숨김
    },
  },
  {
    path: '/listing/:id',
    name: 'listing-detail',
    component: () => import('@/pages/listing/ListingDetailPage.vue'),
    alias: ['/listing/detail'],
    meta: {
      hideHeader: true,    // Header 숨김
    },
  },
//   {
//     path: '/listings/new',
//     name: 'listing-new',
//     component: () => import('@/pages/listing/ListingFormPage.vue'),
//     meta: {
//       requiresAuth: true, // 로그인 필요시
//     },
//   },
//   {
//     path: '/map',
//     name: 'listing-map',
//     component: () => import('@/pages/map/ListingMapPage.vue'),
//   },
]
