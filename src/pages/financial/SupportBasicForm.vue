<!-- src/pages/financial/SupportBasicPage.vue -->
<template>
  <div class="page">
    <SimpleHeader title="지원금" />

    <TopMessage
      class="px"
      :prefix="'지원 대상 확인을 위해'"
      :highlight="'기본 정보'"
      :suffix="'를 입력해주세요'"
    />

    <main class="content px">
      <!-- 현재 상황 -->
      <SelectField
        v-model="store.support.basic.status"
        :items="statusOptions"
        placeholder="현재 상황"
      />

      <!-- 사업장 위치 -->
      <SelectField
        v-model="store.support.basic.location"
        :items="locationOptions"
        placeholder="사업장 위치"
      />

      <!-- 업종 -->
      <SelectField
        v-model="store.support.basic.industry"
        :items="industryOptions"
        placeholder="업종"
      />
    </main>

    <div class="cta-wrap px">
      <BottomCTA :label="'다음'" :reserveBottom="8" @click="goNext">
        <template #below><div class="cta-spacer" /></template>
      </BottomCTA>
    </div>
  </div>
</template>

<script setup>
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import TopMessage from './components/TopMessage.vue';
import BottomCTA from './components/BottomCTA.vue';
import SelectField from './components/SelectField.vue'; // ← 너가 만든 커스텀 셀렉트
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import { useFinancialStore } from '@/stores/financial';

const router = useRouter();
const store = useFinancialStore();
const route = useRoute();

/* 옵션들 (label/value 쌍) */
const statusOptions = [
  { label: '예비창업자', value: '예비창업자' },
  { label: '영업중', value: '영업중' },
  { label: '생계곤란/폐업예정', value: '생계곤란/폐업예정' },
];

const locationOptions = [
  { label: '서울', value: '서울' },
  { label: '부산', value: '부산' },
  { label: '대구', value: '대구' },
  { label: '인천', value: '인천' },
  { label: '광주', value: '광주' },
  { label: '대전', value: '대전' },
  { label: '울산', value: '울산' },
  { label: '세종', value: '세종' },
  { label: '경기', value: '경기' },
  { label: '충북', value: '충북' },
  { label: '충남', value: '충남' },
  { label: '전북', value: '전북' },
  { label: '전남', value: '전남' },
  { label: '경북', value: '경북' },
  { label: '경남', value: '경남' },
  { label: '제주', value: '제주' },
  { label: '강원', value: '강원' },
];

const industryOptions = [
  { label: '제조업', value: '제조업' },
  { label: '음식점업', value: '음식점업' },
  { label: '기타', value: '기타' },
];

const canNext = computed(
  () =>
    !!store.support.basic.status &&
    !!store.support.basic.location &&
    !!store.support.basic.industry
);

function goNext() {
  if (!canNext.value) return;
  // 쿼리에서 넘어온 id 보존 or 나중 단에서 찾은 id 보존
  const id =
    Number(route.query.id || store.support?.currentServiceId || 0) || undefined;
  if (id) {
    store.support = { ...store.support, currentServiceId: id };
  }

  router.push({
    path: '/financial/support-criteria',
    query: id ? { id } : undefined,
  });
}
</script>

<style scoped>
/* 공통 패딩/레이아웃만 남기고, 네이티브 select용 스타일은 전부 제거 */
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
