<template>
  <section class="panel">
    <!-- 가입 대상 -->
    <h3 class="label">가입 대상</h3>
    <div class="chips">
      <SegmentedBtn
        :active="f.target === '개인 사업자'"
        @click="pick('target', '개인 사업자')"
        >개인 사업자</SegmentedBtn
      >
      <SegmentedBtn
        :active="f.target === '온라인셀러'"
        @click="pick('target', '온라인셀러')"
        >온라인셀러</SegmentedBtn
      >
      <SegmentedBtn
        :active="f.target === '기타'"
        @click="pick('target', '기타')"
        >기타</SegmentedBtn
      >
    </div>

    <!-- 담보 여부 -->
    <h3 class="label">담보 여부</h3>
    <div class="chips">
      <SegmentedBtn
        :active="f.collateral === '담보대출'"
        @click="pick('collateral', '담보대출')"
        >담보대출</SegmentedBtn
      >
      <SegmentedBtn
        :active="f.collateral === '신용대출'"
        @click="pick('collateral', '신용대출')"
        >신용대출</SegmentedBtn
      >
    </div>

    <!-- 금리 방식 -->
    <h3 class="label">금리 방식</h3>
    <div class="chips">
      <SegmentedBtn
        :active="f.rate === '고정금리'"
        @click="pick('rate', '고정금리')"
        >고정금리</SegmentedBtn
      >
      <SegmentedBtn
        :active="f.rate === '변동금리'"
        @click="pick('rate', '변동금리')"
        >변동금리</SegmentedBtn
      >
    </div>

    <!-- 상환 방식 -->
    <h3 class="label">상환 방식</h3>
    <div class="chips">
      <SegmentedBtn
        :active="f.repay === '만기일시'"
        @click="pick('repay', '만기일시')"
        >만기일시</SegmentedBtn
      >
      <SegmentedBtn
        :active="f.repay === '원금분할'"
        @click="pick('repay', '원금분할')"
        >원금분할</SegmentedBtn
      >
      <SegmentedBtn
        :active="f.repay === '원리금분할'"
        @click="pick('repay', '원리금분할')"
        >원리금분할</SegmentedBtn
      >
    </div>
  </section>
</template>

<script setup>
import SegmentedBtn from '@/components/common/SegmentedBtn.vue';
import { storeToRefs } from 'pinia';
import { useFinancialStore } from '@/stores/financial';

const store = useFinancialStore();
const { loanFilters: f } = storeToRefs(store);

// 같은 버튼 다시 누르면 해제되게
function pick(key, val) {
  f[key] = f[key] === val ? '' : val;
}
</script>

<style scoped>
.panel {
  padding: 0 16px;
}
.label {
  margin: 16px 0 8px;
  font-weight: 700;
}
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
