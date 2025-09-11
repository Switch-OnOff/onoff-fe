<!-- src/components/financial/SupportFilterPanel.vue -->
<template>
  <section class="panel">
    <h3 class="label">현재 상황</h3>
    <div class="chips">
      <SegmentedBtn
        :active="f.status === '예비창업자'"
        @click="f.status = '예비창업자'"
        >예비창업자</SegmentedBtn
      >
      <SegmentedBtn
        :active="f.status === '영업 중'"
        @click="f.status = '영업 중'"
        >영업 중</SegmentedBtn
      >
      <SegmentedBtn
        :active="f.status === '생계 곤란/폐업 예정자'"
        @click="f.status = '생계 곤란/폐업 예정자'"
        >생계 곤란/폐업 예정자</SegmentedBtn
      >
    </div>

    <h3 class="label">사업장 위치</h3>
    <div class="row">
      <SelectField
        class="s"
        v-model="f.sido"
        :items="sidoItems"
        placeholder="시/도"
      />
      <SelectField
        class="s"
        v-model="f.sigungu"
        :items="sigunguItems"
        placeholder="시/군/구"
      />
    </div>

    <h3 class="label">업종</h3>
    <div class="chips">
      <SegmentedBtn
        :active="f.industry === '음식점업'"
        @click="f.industry = '음식점업'"
        >음식점업</SegmentedBtn
      >
      <SegmentedBtn
        :active="f.industry === '제조업'"
        @click="f.industry = '제조업'"
        >제조업</SegmentedBtn
      >
      <SegmentedBtn :active="f.industry === '기타'" @click="f.industry = '기타'"
        >기타 업종</SegmentedBtn
      >
    </div>
  </section>
</template>

<script setup>
import SegmentedBtn from '@/components/common/SegmentedBtn.vue';
import SelectField from '@/components/common/SelectField.vue';
import { storeToRefs } from 'pinia';
import { useFinancialStore } from '@/stores/financial';
const store = useFinancialStore();
const { supportFilters: f } = storeToRefs(store);

const sidoItems = [
  { label: '서울특별시', value: '서울특별시' },
  { label: '부산광역시', value: '부산광역시' },
];
const sigunguItems = [
  { label: '강남구', value: '강남구' },
  { label: '서초구', value: '서초구' },
];
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
.row {
  display: flex;
  gap: 8px;
}
.s :deep(.field) {
  height: 44px;
}
</style>
