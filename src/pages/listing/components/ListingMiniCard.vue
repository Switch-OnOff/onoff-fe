<!-- src/components/map/ListingMiniCard.vue -->
<template>
  <div
    class="card"
    @click.stop
    @mousedown.stop
    @touchstart.stop
    @touchend.stop
  >
    <!-- 상단 썸네일 -->
    <div class="thumb-wrap">
      <img
        :src="item.thumbnail"
        :alt="`${item.title} 사진`"
        class="thumb"
        loading="lazy"
        draggable="false"
        @error="onImgError"
      />
      <!-- 거래 타입 뱃지 -->
      <span
        class="badge bodyMedium12px"
        :class="item.transactionType === 'SALE' ? 'badge-sale' : 'badge-monthly'"
      >
        {{ item.transactionType === 'SALE' ? '매매' : '월세' }}
      </span>
    </div>

    <!-- 본문 -->
    <div class="body">
      <h3 class="title bodyBold14px">{{ item.title }}</h3>
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
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
})
defineEmits(['close'])

const fmtMan = (n) => {
  const v = Number(n)
  if (!Number.isFinite(v)) return '-'
  const eok = Math.floor(v / 10000)            // 억
  const man = v % 10000                         // 만원
  return eok > 0 ? `${eok}억 ${man.toLocaleString('ko-KR')}` : man.toLocaleString('ko-KR')
}

const priceText = computed(() => {
  if (props.item.transactionType === 'SALE') {
    return `매매 ${fmtMan(props.item.salePrice)}`
  }
  const d = fmtMan(props.item.deposit)
  const m = fmtMan(props.item.monthlyRent)
  return `보증금 ${d} / 월세 ${m}`
})

function onImgError(e) {
  e.target.src = 'https://placehold.co/240x160?text=IMG'  //나중에 폴백 이미지 변경 필요(leeday)
}
</script>

<style scoped>
.card{
  width: 248px;
  background:#fff;
  border-radius:12px;
  box-shadow:0 8px 22px rgba(0,0,0,.12);
  overflow:hidden;
  position:relative;
  border:1px solid var(--color-white);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* 썸네일 */
.thumb-wrap{ position: relative; }
.thumb{
  width:100%;
  height:118px;   
  object-fit:cover;
  display:block;
}

/* 거래타입 뱃지 */
.badge{
  position:absolute; left:8px; top:8px;
  padding:4px 8px;
  border-radius:999px;
  line-height:1;
  background: var(--color-primary); 
  color: var(--color-white);
}

/* 본문 */
.body{ padding:10px 12px 12px; }
.title{ margin:0 0 6px; }
.price{
  margin:0 0 6px;
  color: var(--color-primary);
}
.addr{ 
  margin:0; 
  color: var(--color-darkgray);
}

/* 하단 CTA 바 (전체 폭) */
.cta-bar{
  display:block;
  text-align:center;
  padding:10px 12px;
  color:#fff;
  text-decoration:none;
  background: var(--color-primary);
  user-select:none;
}

/* 닫기 버튼 */
.close{
  position:absolute; top:6px; right:6px;
  width:24px; height:24px;
  border-radius:50%;
  background:var(--color-white);
  cursor:pointer;
  line-height:1;
  user-select:none;
}
</style>
