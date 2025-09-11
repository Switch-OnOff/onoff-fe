<template>
  <SimpleHeader />
  <div class="container">
    <div class="segment-wrapper">
      <SegmentedBtn class="tag-segment">지원금</SegmentedBtn>
      <SegmentedBtn class="tag-segment">현금</SegmentedBtn>
    </div>
    <div class="title">
      <div class="img-box"><img :src="GovIcon" /></div>
      <div class="titleExtra20px">{{ detail?.loanName || '대출 상세' }}</div>
    </div>
    <div class="content-box">
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">가입 대상</div>
        <div class="bodyRegular16px">{{ detail?.eligibleGroup || '전체' }}</div>
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
        <div class="bodyRegular16px">{{ detail?.repaymentMethod || '-' }}</div>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">금리</div>
        <div class="bodyRegular16px">
          최저 {{ detail?.minInterestRate ?? '-' }} 최고
          {{ detail?.maxInterestRate ?? '-' }} 전월평균
          {{ detail?.avgInterestRate ?? '-' }}
        </div>
      </div>
      <div class="label-wrapper" v-if="detail?.requirements">
        <div class="content-title bodyBold16px">가입 요건</div>
        <div class="bodyRegular16px">{{ detail?.requirements }}</div>
      </div>
    </div>
    <BottomCTA :label="'상품 페이지로 이동'" />
  </div>
</template>

<script setup>
import SegmentedBtn from '@/components/common/SegmentedBtn.vue';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import GovIcon from '@/assets/icons/financial/logo_gov.png';
import BottomCTA from './components/BottomCTA.vue';
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import * as loans from '@/api/loan';

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
  // /financial/loan/:loanId
  const p = Number(route.params.loanId);
  if (!Number.isNaN(p) && p > 0) return p;
  // /financial/loan-detail?id=123
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
</script>

<style scoped>
.container {
  padding: 2rem;
}
.segment-wrapper {
  display: flex;
  gap: 8px;
}
.tag-segment {
  padding: 0.2px 10px;
  background-color: var(--color-lightgray);
}

.title {
  margin-top: 1.3rem;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 15px;
}

.img-box {
  width: 40px;
  height: 40px;
  background-color: var(--color-lightgray);
  border-radius: 5rem;
}

.img-box > img {
  width: 100%;
  height: 100%;
}

.content-box {
  border: 1.5px solid var(--color-lightgray);
  border-radius: 14px;
  padding: 1rem 0.75rem;
  margin-top: 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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
.titleExtra20px {
  margin-top: 2px;
}
</style>
