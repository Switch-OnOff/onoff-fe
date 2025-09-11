export default [
  {
    path: '/financial',
    name: 'finintro',
    component: () => import('../pages/financial/FinIntroPage.vue'),
    meta: { layout: 'default', title: '지원/대출 - 메인', hideHeader: false },
  },
  {
    path: '/financial/select', // ✅ 추가
    name: 'finselect',
    component: () => import('../pages/financial/FinSelectPage.vue'),
    meta: { layout: 'default', title: '지원/대출 - 선택', hideHeader: true },
  },
  {
    path: '/financial/support-basic',
    name: 'support-basic',
    component: () => import('../pages/financial/SupportBasicForm.vue'),
    meta: { layout: 'default', title: '지원금 - 기본정보', hideHeader: true },
  },
  {
    path: '/financial/support-criteria',
    name: 'support-criteria',
    component: () => import('../pages/financial/SupportCriteriaCheck.vue'),
    meta: { layout: 'default', title: '지원금 - 선정기준', hideHeader: true },
  },
  {
    path: '/financial/support-docs',
    name: 'support-docs',
    component: () => import('../pages/financial/SupportDocs.vue'),
    meta: { layout: 'default', title: '지원금 - 서류확인', hideHeader: true },
  },
  {
    path: '/financial/loan-basic',
    name: 'loan-basic',
    component: () => import('../pages/financial/LoanBasicForm.vue'),
    meta: { layout: 'default', title: '대출 - 기본정보', hideHeader: true },
  },
  {
    path: '/financial/result',
    name: 'finresult',
    // ✅ 결과 분기: eligible | caution | ineligible
    component: () => import('../pages/financial/FinResultPage.vue'),
    meta: { layout: 'default', title: '지원/대출 - 결과', hideHeader: true },
  },
  {
    path: '/financial/list',
    name: 'FinancialList',
    component: () => import('@/pages/financial/FinListPage.vue'),
    meta: { layout: 'default', title: '지원/대출 - 목록', hideHeader: true },
  },
];
