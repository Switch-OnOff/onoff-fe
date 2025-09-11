<!-- src/components/map/ListingMiniCard.vue -->
<template>
  <div class="card" @click.stop @mousedown.stop @touchstart.stop @touchend.stop>
    <!-- 상단 썸네일 -->
    <div class="thumb-wrap">
      <img
        :src="item.thumbnail"
        :alt="altText"
        class="thumb"
        loading="lazy"
        draggable="false"
        @error="onImgError"
      />
      <!-- 거래 타입 뱃지 (클래스 분리) -->
      <span
        class="deal-badge bodyMedium12px"
        :class="
          item.transactionType === 'SALE' ? 'badge-sale' : 'badge-monthly'
        "
      >
        {{ item.transactionType === 'SALE' ? '매매' : '월세' }}
      </span>
    </div>

    <!-- 본문 -->
    <div class="body">
      <!-- industry 배지 -->
      <span v-if="item.industry" class="badge bodySemiBold12px">{{
        item.industry
      }}</span>
      <p class="price bodyBold14px">{{ priceText }}</p>
      <p class="addr bodyMedium12px">{{ item.address }}</p>
    </div>

    <!-- 하단 CTA 바 (풀-폭) -->
    <router-link
      class="cta-bar"
      :to="{ name: 'listing-detail', params: { id: item.id } }"
      @click.stop
      @mousedown.stop
      @touchstart.stop
      @touchend.stop
      draggable="false"
    >
      상세보기
    </router-link>

    <!-- 닫기 -->
    <button
      class="close"
      @click.stop="$emit('close')"
      @mousedown.stop
      @touchstart.stop
      @touchend.stop
      aria-label="닫기"
      draggable="false"
    >
      ×
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import fallbackImg from '@/assets/images/fallback-image.png';

const props = defineProps({
  item: { type: Object, required: true },
});
defineEmits(['close']);

/** 만원 → "3억 5천" 형태(천 단위 딱 떨어지면 '천' 표기) */
function fmtManPretty(n) {
  if (n === null || n === undefined) return '없음';
  const v = Number(n);
  if (!Number.isFinite(v)) return '없음';

  const eok = Math.floor(v / 10000);
  const man = v % 10000;
  let manStr = '';
  if (man > 0) {
    manStr = man % 1000 === 0 ? `${man / 1000}천` : man.toLocaleString('ko-KR');
  }

  if (eok > 0) {
    return manStr ? `${eok}억 ${manStr}` : `${eok}억`;
  }

  return manStr || '없음';
}

const priceText = computed(() => {
  if (props.item.transactionType === 'SALE') {
    return `매매 ${fmtManPretty(props.item.salePrice)}`;
  }
  return `월세 ${fmtManPretty(props.item.deposit)}/${fmtManPretty(
    props.item.rent
  )}`;
});

/* title 없이 alt 생성 */
const altText = computed(
  () => `${props.item.industry || props.item.address || '매물'} 사진`
);

function onImgError(e) {
  const img = e.target;
  img.onerror = null;
  img.src = fallbackImg;
}
</script>

<style scoped>
.card {
  width: 248px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  position: relative;
  border: 1px solid var(--color-white);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* 썸네일 */
.thumb-wrap {
  position: relative;
}
.thumb {
  width: 100%;
  height: 118px;
  object-fit: cover;
  display: block;
}

/* 거래타입 뱃지(상단 오버레이) */
.deal-badge {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  line-height: 1;
  background: var(--color-primary);
  color: var(--color-white);
}

/* 본문 */
.body {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* industry 배지 */
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

.price {
  margin: 0;
  color: var(--color-black);
}
.addr {
  margin: 0;
  color: var(--color-darkgray);
}

/* 하단 CTA 바 (전체 폭) */
.cta-bar {
  display: block;
  text-align: center;
  padding: 10px 12px;
  color: var(--color-white);
  text-decoration: none;
  background: var(--color-primary);
  user-select: none;
}

/* 닫기 버튼 */
.close {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-white);
  cursor: pointer;
  line-height: 1;
  user-select: none;
}
</style>
