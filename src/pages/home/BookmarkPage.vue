<template>
  <div class="bookmarks-page">
    <SimpleHeader title="관심 매물" />

    <div class="list">
      <ListingCard
        v-for="item in items"
        :key="item.id"
        :id="item.id"
        :img="item.img"
        :industry="item.industry"
        :transactionType="item.transactionType"
        :deposit="item.deposit"
        :rent="item.rent"
        :salePrice="item.salePrice"
        :premium="item.premium"
        :exclusiveArea="item.exclusiveArea"
        :location="item.location"
        :bookmarked="true"
      />
      <p v-if="!items.length" class="empty bodyRegular14px">
        관심 매물이 없습니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import ListingCard from '@/pages/listing/components/ListingCard.vue';
import marketThumb1 from '@/assets/images/sample/sample-image1.png';
import marketThumb2 from '@/assets/images/sample/sample-image2.png';
import marketThumb3 from '@/assets/images/sample/sample-image3.png';

// 프론트 전용 목데이터
const items = ref([
  {
    id: 101,
    img: marketThumb1,
    industry: '일반음식점/양식',
    transactionType: '월세',
    deposit: 2000,
    rent: 180,
    salePrice: null,
    premium: 3000,
    exclusiveArea: 22.5,
    location: '서울 강남구 역삼동',
  },
  {
    id: 102,
    img: marketThumb2,
    industry: '카페/디저트',
    transactionType: '매매',
    deposit: null,
    rent: null,
    salePrice: 85000,
    premium: 0,
    exclusiveArea: 18.2,
    location: '서울 마포구 연남동',
  },
  {
    id: 103,
    img: marketThumb3,
    industry: '주점/이자카야',
    transactionType: '월세',
    deposit: 5000,
    rent: 250,
    salePrice: null,
    premium: 1500,
    exclusiveArea: 26.8,
    location: '부산 수영구',
  },
]);
</script>

<style scoped>
.bookmarks-page {
  max-width: 393px;
  width: 100%;
  margin: 0 auto;
  background: var(--color-white);
  box-sizing: border-box;
}

.list {
  padding: 0 16px;
}

.empty {
  color: var(--color-darkgray);
  padding: 16px 2px 8px;
}
</style>
