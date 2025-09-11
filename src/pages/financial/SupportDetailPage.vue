<template>
  <SimpleHeader />
  <div class="container">
    <div class="segment-wrapper">
      <SegmentedBtn class="tag-segment">지원금</SegmentedBtn>
      <SegmentedBtn class="tag-segment">현금</SegmentedBtn>
    </div>
    <div class="title">
      <div class="img-box"><img :src="GovIcon" /></div>
      <div class="titleExtra20px">소상공인 경영안정 바우처</div>
    </div>
    <div class="content-box">
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">지원 내용</div>
        <div class="bodyRegular16px">
          사업장별 시설개선비 최대 200만원 지원(공급가액의 70% 이내)
        </div>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">지원 대상</div>
        <div class="bodyRegular16px">
          사업장별 시설개선비 최대 200만원 지원(공급가액의 70% 이내)
        </div>
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
  padding: 1rem 0.5rem;
  margin-top: 1.3rem;
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
</style>
