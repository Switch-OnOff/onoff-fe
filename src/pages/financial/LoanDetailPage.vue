<template>
  <SimpleHeader />
  <div class="container" v-if="detail">
    <div class="segment-wrapper">
      <SegmentedBtn class="tag-segment">대출</SegmentedBtn>
      <SegmentedBtn class="tag-segment">{{ detail.loanType }}</SegmentedBtn>
    </div>

    <div class="title">
      <div class="img-box"><img :src="GovIcon" alt="icon" /></div>
      <div class="titleExtra20px">{{ detail.loanName }}</div>
    </div>

    <div class="content-box">
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">기관</div>
        <div class="bodyRegular16px">{{ detail.loanCompany }}</div>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">대상</div>
        <div class="bodyRegular16px">{{ detail.eligibleGroup }}</div>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">금리</div>
        <div class="bodyRegular16px">
          {{ detail.interestType }}
          <span v-if="detail.minInterestRate"
            >/ 최저 {{ detail.minInterestRate }}%</span
          >
        </div>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">상환</div>
        <div class="bodyRegular16px">{{ detail.repaymentMethod }}</div>
      </div>
      <div class="label-wrapper" v-if="detail.requirements">
        <div class="content-title bodyBold16px">조건</div>
        <div class="bodyRegular16px pre">{{ detail.requirements }}</div>
      </div>
    </div>

    <div class="box">
      <h3 class="bodyBold16px">신호등 평가</h3>
      <form @submit.prevent="doEvaluate" class="grid">
        <label>신용점수</label
        ><input
          type="number"
          v-model.number="form.creditScore"
          placeholder="700"
        />
        <label>희망대출액</label
        ><input
          type="number"
          v-model.number="form.loanAmount"
          placeholder="10000000"
        />
        <label>상환월수</label
        ><input
          type="number"
          v-model.number="form.repaymentMonths"
          placeholder="36"
        />
        <label>월소득</label
        ><input
          type="number"
          v-model.number="form.income"
          placeholder="2500000"
        />
        <label>상환비율(‰)</label
        ><input
          type="number"
          v-model.number="form.repayRatio"
          placeholder="400 (40%)"
        />
        <button class="primary">평가</button>
      </form>
      <div v-if="result" class="mt">
        <p>
          월 상환액: <b>{{ result.monthlyPayment.toLocaleString() }}</b
          >원
        </p>
        <p>
          등급: <b>{{ result.grade }}</b> (점수 {{ result.score }})
        </p>
        <p>상환방식: {{ result.usedRepaymentMethod }}</p>
      </div>
    </div>
  </div>
  <div v-else class="px">불러오는 중…</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import * as loans from '@/api/loan';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import SegmentedBtn from '@/components/common/SegmentedBtn.vue';
import GovIcon from '@/assets/icons/gov.png';

const route = useRoute();
const detail = ref(null);
const result = ref(null);
const form = ref({
  creditScore: 700,
  loanAmount: 10000000,
  repaymentMonths: 36,
  income: 2500000,
  repayRatio: 400,
});

async function resolveLoanIdFromKeyword(keyword) {
  const arr = (await loans.searchLoans(keyword)) || [];
  const hit = arr.find((x) => x.loanName?.includes(keyword)) || arr[0];
  return hit?.loanId;
}

onMounted(async () => {
  try {
    let id = Number(route.query.id || 0);
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
  if (!detail.value?.loanId) return;
  result.value = await loans.evaluateLoan(detail.value.loanId, form.value);
}
</script>

<style scoped>
.container {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.segment-wrapper {
  display: flex;
  gap: 6px;
}
.tag-segment {
  background: #f5f5ff;
}
.title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.img-box {
  width: 24px;
  height: 24px;
}
.content-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.label-wrapper {
  display: flex;
  gap: 8px;
}
.content-title {
  color: var(--color-darkgray);
  min-width: 60px;
}
.pre {
  white-space: pre-wrap;
}
.box {
  margin-top: 8px;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 12px;
}
.grid {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 0.5rem 0.75rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
.primary {
  grid-column: 1 / -1;
  height: 40px;
  border-radius: 10px;
  background: var(--color-primary);
  color: #fff;
}
.mt {
  margin-top: 0.5rem;
}
.px {
  padding: 0 16px;
}
</style>
