<!-- components/listing/ListingCard.vue -->
<template>
  <RouterLink class="listing-card-link" :to="`/listing/${id}`">
    <div class="listing-card">
      <!-- 썸네일 -->
      <div class="thumb-wrap">
        <img :src="imageSrc" alt="매물 썸네일" class="thumb" />
      </div>

      <div class="content">
        <!-- 업종 배지 -->
        <div class="badge bodySemiBold14px" v-if="industry">{{ industry }}</div>

        <!-- 메인 가격 라인 -->
        <div class="title bodySemiBold16px">
          <template
            v-if="transactionType === '월세' || transactionType === '임대'"
          >
            월세 {{ depositText }}/{{ rentText }}
          </template>
          <template v-else>
            매매 {{ saleText }}<span v-if="rent"> {{ rentText }}</span>
          </template>
        </div>

        <!-- 권리금 -->
        <div class="premium bodyBold14px" v-if="premium != null">
          권리금 {{ premiumText }}
        </div>

        <!-- 하단 면적&지역 -->
        <div class="meta bodyRegular14px">
          <span v-if="exclusiveArea">{{ exclusiveArea }}평</span>
          <span v-if="exclusiveArea && location"> · </span>
          <span v-if="location">{{ location }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: { type: [Number, String], required: true },
  img: { type: String, default: '' },
  industry: { type: String, default: '' }, // 예) "일반음식점/양식"
  transactionType: { type: String, default: '월세' }, // '월세' | '매매' | '임대'
  deposit: { type: [Number, String], default: null }, // 만원
  rent: { type: [Number, String], default: null }, // 만원
  salePrice: { type: [Number, String], default: null }, // 매매가(만원)
  premium: { type: [Number, String], default: null }, // 권리금(만원)
  exclusiveArea: { type: [Number, String], default: null }, // 평
  location: { type: String, default: '' }, // "제주시 애월읍"
});

const imageSrc = computed(
  () => props.img || 'https://placehold.co/160x120?text=STORE'
);

/** 만원 단위를 "3억 5,000" 형식으로 */
function formatManwon(v) {
  if (v === null || v === undefined || v === '') return '없음';
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return '없음';

  const eok = Math.floor(n / 10000); // 억
  const man = n % 10000; // 만

  if (eok > 0) {
    return man > 0 ? `${eok}억 ${man.toLocaleString()}` : `${eok}억`;
  }
  return man > 0 ? man.toLocaleString() : '없음';
}

const depositText = computed(() => formatManwon(props.deposit));
const rentText = computed(() => formatManwon(props.rent));
const saleText = computed(() => formatManwon(props.salePrice));
const premiumText = computed(() => formatManwon(props.premium));
</script>

<style scoped>
.listing-card {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-lightgray);
  align-items: center;
  background: var(--color-white);
}

.thumb-wrap {
  flex-shrink: 0;
  padding-left: 2px;
  display: flex;
  align-items: center;
}
.thumb {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  background: var(--color-lightgray);
  display: block;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 6px;
  background: var(--color-primary-10);
  color: var(--color-primary);
  border-radius: 2px;
  width: auto;
  max-width: 100%;
}
.badge .ellipsis {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
}

.title {
  line-height: 1.1;
  color: var(--color-black);
}

/* 권리금은 포인트 컬러 */
.premium {
  color: var(--color-primary);
}

/* 하단 메타 */
.meta {
  color: var(--color-darkgray);
}

/* 링크 기본 스타일 제거 */
.listing-card-link {
  text-decoration: none;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
  display: block;
}
</style>
