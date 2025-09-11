// src/router/modules/listing.js
export default [
  {
    path: '/listing',
    name: 'listing-list',
    component: () => import('@/pages/listing/ListingsPage.vue'),
    meta: { hideHeader: true },
  },
  {
    // 지도 페이지
    path: '/listing/map',
    name: 'listing-map',
    component: () => import('@/pages/listing/ListingsMapPage.vue'),
    alias: ['/map/listings'], // 기존/대체 경로 호환용
    meta: { hideHeader: true },
  },
  {
    // 상세 페이지
    path: '/listing/:id',
    name: 'listing-detail',
    component: () => import('@/pages/listing/ListingDetailPage.vue'),
    alias: ['/listing/detail/:id'],
    props: true,              // id를 컴포넌트 props로 전달
    meta: { hideHeader: true },
  },
  {
    path: '/listing/new',
    name: 'listing-new',
    component: () => import('@/pages/listing/RegisterListingPage.vue'),
    meta: { requiresAuth: true },
  },
]
