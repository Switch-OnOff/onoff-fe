<template>
  <div class="page">
    <SimpleHeader title="대출" />

    <TopMessage
      class="px"
      :prefix="'대출 가능 여부 확인을 위해'"
      :highlight="'기본 정보'"
      :suffix="'를 입력해주세요'"
    />

    <main class="content px">
      <!-- 신용 점수 -->
      <SelectField
        v-model="store.loan.basic.creditScore"
        :items="scoreOptions"
        placeholder="신용 점수 (예: 700 이상)"
      />

      <!-- 월 소득 -->
      <InputSimple
        v-model.number="store.loan.basic.monthlyIncome"
        type="number"
        placeholder="월 소득 (원)"
      />

      <!-- 희망 대출 금액 -->
      <InputSimple
        v-model.number="store.loan.basic.desiredAmount"
        type="number"
        placeholder="희망 대출 금액 (원)"
      />

      <!-- 상환 개월 수 -->
      <SelectField
        v-model="repaymentMonths"
        :items="repayOptions"
        placeholder="상환 개월 수"
      />

      <!-- 소득 대비 상환 비율(‰) -->
      <SelectField
        v-model="repayRatio"
        :items="ratioOptions"
        placeholder="소득 대비 상환 비율(%)"
      />
    </main>

    <div class="cta-wrap px">
      <BottomCTA :label="'결과 확인'" :reserveBottom="8" @click="onEvaluate">
        <template #below><div class="cta-spacer" /></template>
      </BottomCTA>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import TopMessage from './components/TopMessage.vue';
import BottomCTA from './components/BottomCTA.vue';
import SelectField from '@/components/common/SelectField.vue';
import InputSimple from '@/components/input/InputSimple.vue';
import { useFinancialStore } from '@/stores/financial';
import * as loans from '@/api/loan';

const router = useRouter();
const route = useRoute();
const store = useFinancialStore();

const scoreOptions = [
  { label: '800 이상', value: 800 },
  { label: '700 이상', value: 700 },
  { label: '600 이상', value: 600 },
];

const repayOptions = [
  { label: '12개월', value: 12 },
  { label: '24개월', value: 24 },
  { label: '36개월', value: 36 },
  { label: '60개월', value: 60 },
];

const ratioOptions = [
  { label: '30%', value: 30 },
  { label: '40%', value: 40 },
  { label: '50%', value: 50 },
];

const repaymentMonths = ref(null);
const repayRatio = ref(null);

const resolvedLoanId = computed(() => {
  const p = Number(route.query.id || route.params.loanId || 0);
  return Number.isFinite(p) && p > 0 ? p : 0;
});

async function onEvaluate() {
  const basic = store.loan.basic || {};
  const body = {
    creditScore: Number(basic.creditScore || 0),
    loanAmount: Number(basic.desiredAmount || 0),
    repaymentMonths: Number(repaymentMonths.value || 0),
    income: Number(basic.monthlyIncome || 0),
    // API는 ‰ 단위 → UI는 % 단위이므로 10배로 변환
    repayRatio: Number(repayRatio.value || 0) * 10,
  };

  // 간단 유효성 검사
  if (!body.creditScore) return alert('신용 점수를 선택해주세요.');
  if (!body.income) return alert('월 소득을 입력해주세요.');
  if (!body.loanAmount) return alert('희망 대출 금액을 입력해주세요.');
  if (!repaymentMonths.value) return alert('상환 개월 수를 선택해주세요.');
  if (!repayRatio.value) return alert('소득 대비 상환 비율을 선택해주세요.');

  // loanId: 쿼리/파람에서 먼저 시도, 없으면 키워드 기반으로 보정
  let loanId = resolvedLoanId.value;
  try {
    if (!loanId) {
      const kw = (sessionStorage.getItem('financial-keyword') || '').trim();
      if (kw) {
        const list = (await loans.searchLoans(kw)) || [];
        loanId = list?.[0]?.loanId || 0;
      }
    }
    if (!loanId) {
      alert('평가할 대출 상품을 찾지 못했어요.');
      return;
    }

    const result = await loans.evaluateLoan(loanId, body);
    // API 결과에서 status/조언(reason) 유추 (방어적으로 다양한 키 지원)
    function mapStatus(r) {
      const v = (r?.status || r?.signal || r?.traffic || r?.level || '')
        .toString()
        .toLowerCase();
      if (['green', 'eligible', 'ok', 'pass'].includes(v)) return 'eligible';
      if (['red', 'ineligible', 'fail', 'deny'].includes(v))
        return 'ineligible';
      if (['yellow', 'caution', 'warn'].includes(v)) return 'caution';
      // 점수/지표 기반 추정
      const score = Number(r?.score ?? r?.grade ?? NaN);
      if (Number.isFinite(score)) {
        if (score >= 80) return 'eligible';
        if (score >= 60) return 'caution';
        return 'ineligible';
      }
      // 부채비율 등 추가 지표가 있다면 여기서 판정 가능
      return 'caution';
    }

    const status = mapStatus(result);
    const product = result?.loanName || result?.name || '대출 상품';
    const adviceFromApi = Array.isArray(result?.reasons)
      ? result.reasons
      : Array.isArray(result?.advice)
      ? result.advice
      : Array.isArray(result?.messages)
      ? result.messages
      : [];

    const fmt = (n) =>
      Number.isFinite(Number(n)) ? Number(n).toLocaleString() : String(n ?? '');
    const enrich = [];
    if (result?.monthlyPayment != null)
      enrich.push(`월 상환 예상액: ${fmt(result.monthlyPayment)}원`);
    if (result?.usedRepaymentMethod)
      enrich.push(`상환 방식(예상): ${result.usedRepaymentMethod}`);
    if (result?.score != null || result?.grade)
      enrich.push(
        `평가 지표: ${fmt(result.score)}점` +
          (result?.grade ? `, 등급 ${result.grade}` : '')
      );
    const advice = [...adviceFromApi, ...enrich];

    const q = new URLSearchParams({
      status: String(status),
      product: String(product),
    });
    if (advice.length) q.set('reasons', advice.slice(0, 6).join(','));
    router.push(`/financial/result?${q.toString()}`);
  } catch (e) {
    console.error('대출 평가 실패:', e);
    alert('대출 평가에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}
</script>

<style scoped>
.px {
  padding-left: 2rem;
  padding-right: 2rem;
}

.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.cta-wrap {
  margin-top: auto;
}
.cta-spacer {
  height: 1.185rem;
}
</style>
