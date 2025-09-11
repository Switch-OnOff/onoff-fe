<template>
  <div class="page px">
    <h2>
      대출 가능 여부 확인을 위해
      <span class="highlight">기본 정보를</span> 입력해주세요
    </h2>

    <select v-model="store.loan.basic.creditScore">
      <option value="">신용 점수</option>
      <option value="800">800 이상</option>
      <option value="700">700 이상</option>
      <option value="600">600 이상</option>
    </select>

    <input
      type="number"
      v-model="store.loan.basic.monthlyIncome"
      placeholder="월 소득 (원)"
    />
    <input
      type="number"
      v-model="store.loan.basic.desiredAmount"
      placeholder="희망 대출 금액 (원)"
    />

    <button class="btn" @click="$emit('next')">다음</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useFinancialStore } from '@/stores/financial';

const router = useRouter();
const store = useFinancialStore();

function goNext() {
  const basic = store.loan.basic || {};
  const score = Number(basic.creditScore || 0);

  let status = 'ineligible';
  if (score >= 700) status = 'eligible';
  else if (score >= 600) status = 'caution';

  const product = '소상공인 희망대출'; // TODO: 실제 상품명으로 치환
  router.push(
    `/financial/result?status=${status}&product=${encodeURIComponent(product)}`
  );
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.highlight {
  color: var(--color-primary);
  font-weight: bold;
}
.btn {
  margin-top: 2rem;
}
</style>
