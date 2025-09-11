<!-- src/pages/financial/LoanDetailPage.vue -->
<template>
  <div class="page">
    <SimpleHeader title="대출" />

    <div class="px">
      <!-- 태그 세그먼트 -->
      <div class="segment-wrapper mt16">
        <SegmentedBtn class="tag-segment">대출</SegmentedBtn>
        <SegmentedBtn class="tag-segment">담보대출</SegmentedBtn>
      </div>

      <!-- 타이틀 -->
      <div class="title mt12">
        <div class="img-box" aria-hidden="true">
          <img v-if="logoSrc" :src="logoSrc" alt="" />
          <div v-else class="thumb-fallback">…</div>
        </div>
        <div class="titleExtra20px">
          {{ detail?.loanName || '대출 상세' }}
        </div>
      </div>

      <!-- 내용 카드 -->
      <section class="content-box card">
        <div class="label-wrapper">
          <div class="content-title bodyBold16px">가입 대상</div>
          <div class="bodyRegular16px">
            {{ detail?.eligibleGroup || '전체' }}
          </div>
        </div>
        <div class="label-wrapper">
          <div class="content-title bodyBold16px">금융 회사</div>
          <div class="bodyRegular16px">{{ detail?.loanCompany || '-' }}</div>
        </div>
        <div class="label-wrapper">
          <div class="content-title bodyBold16px">금리 방식</div>
          <div class="bodyRegular16px">{{ detail?.interestType || '-' }}</div>
        </div>
        <div class="label-wrapper">
          <div class="content-title bodyBold16px">상환 방식</div>
          <div class="bodyRegular16px">
            {{ detail?.repaymentMethod || '-' }}
          </div>
        </div>
        <div class="label-wrapper">
          <div class="content-title bodyBold16px">금리</div>
          <div class="bodyRegular16px">
            최저 {{ detail?.minInterestRate ?? '-' }} · 최고
            {{ detail?.maxInterestRate ?? '-' }}
            <span v-if="detail?.avgInterestRate">
              · 전월평균 {{ detail?.avgInterestRate }}</span
            >
          </div>
        </div>
        <div class="label-wrapper" v-if="detail?.requirements">
          <div class="content-title bodyBold16px">가입 요건</div>
          <div class="bodyRegular16px">{{ detail?.requirements }}</div>
        </div>
      </section>
    </div>

    <!-- CTA 영역: 결과 페이지와 동일한 래핑/스페이서 -->
    <div class="cta-wrap px">
      <BottomCTA :label="'상품 페이지로 이동'" :reserve-bottom="8">
        <template #below>
          <div class="cta-spacer"></div>
        </template>
      </BottomCTA>
    </div>
  </div>
</template>

<script setup>
import SegmentedBtn from '@/components/common/SegmentedBtn.vue';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import BottomCTA from './components/BottomCTA.vue';
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import * as loans from '@/api/loan';
import { getLogoSrc } from './utils/logo.js';

const route = useRoute();

const detail = ref(null);
const result = ref(null);
const form = ref({
  creditScore: 700,
  loanAmount: 10000000,
  repaymentMonths: 36,
  income: 2500000,
  repayRatio: 400, // ‰ (퍼밀)
});

const loanId = computed(() => {
  const p = Number(route.params.loanId);
  if (!Number.isNaN(p) && p > 0) return p;
  const q = Number(route.query.id);
  if (!Number.isNaN(q) && q > 0) return q;
  return 0;
});

async function resolveLoanIdFromKeyword(keyword) {
  const arr = (await loans.searchLoans(keyword)) || [];
  const hit = arr.find((x) => x.loanName?.includes(keyword)) || arr[0];
  return hit?.loanId || 0;
}

onMounted(async () => {
  try {
    let id = loanId.value;
    if (!id) {
      const kw = sessionStorage.getItem('financial-keyword') || '';
      if (kw) id = await resolveLoanIdFromKeyword(kw);
    }
    if (!id) return;
    detail.value = await loans.getLoanDetail(id);
  } catch (e) {
    console.error('대출 상세 로드 실패', e);
  }
});

async function doEvaluate() {
  const id = detail.value?.loanId || loanId.value;
  if (!id) return;
  result.value = await loans.evaluateLoan(id, form.value);
}

const logoSrc = computed(() =>
  getLogoSrc({ mode: 'loan', loanCompany: detail.value?.loanCompany })
);
</script>

<style scoped>
/* 결과 페이지와 동일한 컨테이너 규칙 */
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
}
.px {
  padding-left: 2rem;
  padding-right: 2rem;
}
.mt16 {
  margin-top: 1rem;
}
.mt12 {
  margin-top: 0.75rem;
}

/* 세그먼트 */
.segment-wrapper {
  display: flex;
  gap: 8px;
  margin-top: 2rem;
  margin-bottom: 2rem;
}
.tag-segment {
  padding: 0.2px 10px;
  background: var(--color-lightgray);
  border-radius: 9999px;
}

/* 타이틀 */
.title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 0.25rem;
}
.img-box {
  width: 40px;
  height: 40px;
  background-color: var(--color-lightgray);
  border-radius: 9999px;
  overflow: hidden;
  display: grid;
  place-items: center;
}
.img-box > img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.thumb-fallback {
  font-size: 18px;
  color: #999;
}
.titleExtra20px {
  margin-top: 2px;
}

/* 카드(보더/라운드 결과·리스트와 톤 통일) */
.card {
  border: 1px solid #eee;
  border-radius: 14px;
  background: #fff;
}
.content-box {
  padding: 1rem 0.75rem;
  margin-top: 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 라벨/값 */
.label-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.content-title {
  color: var(--color-darkgray);
  min-width: 80px;
  flex: 0 0 80px;
}
.bodyRegular16px {
  color: var(--color-black);
}

/* CTA 위치/스페이서: 결과 페이지와 동일 */
.cta-wrap {
  margin-top: auto;
}
.cta-spacer {
  height: 1.185rem;
}
</style>
