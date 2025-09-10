// 금융(인트로/결과) 전용 라우트
export default [
  {
    path: '/financial',
    name: 'finintro',
    component: () => import('../pages/financial/FinIntroPage.vue'),
    meta: { layout: 'default', title: '지원/대출 - 메인', hideHeader: true },
  },
  {
    path: '/financial/result',
    name: 'finresult',
    // ?status=eligible|partial|ineligible 로 분기
    component: () => import('../pages/financial/FinResultPage.vue'),
    meta: { layout: 'default', title: '지원/대출 - 결과', hideHeader: true },
  },
];
