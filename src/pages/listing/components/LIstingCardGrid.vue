<!-- components/listing/ListingCardGrid.vue -->
<template>
  <RouterLink :to="`/listing/${id}`" class="listing-card-link">
    <div class="listing-card grid">
      <!-- 썸네일 이미지 -->
      <img :src="imageSrc" alt="매물 썸네일" class="thumb" />

      <!-- 본문 줄 수/높이 고정 + 말줄임 -->
      <div class="content">
        <!-- 업종 배지 -->
        <div class="badge bodySemiBold12px">
          <span class="ellipsis">{{ category || '없음' }}</span>
        </div>

        <!-- 메인 가격 라인 -->
        <div class="title bodySemiBold14px">
          <span class="ellipsis">{{ titleLine }}</span>
        </div>

        <!-- 권리금 -->
        <div class="premium bodySemiBold12px">
          <span class="ellipsis">권리금 {{ premiumText }}</span>
        </div>

        <!-- 하단 메타 -->
        <div class="meta bodyRegular12px">
          <span class="ellipsis">{{ metaLine }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: [Number, String], required: true },
  img: { type: String, default: '' },
  category: { type: String, default: '' },               // 예) "일반음식점/양식"
  dealType: { type: String, default: '월세' },           // '월세' | '매매' | '임대'
  deposit: { type: [Number, String], default: null },    // 만원
  rent: { type: [Number, String], default: null },       // 만원
  salePrice: { type: [Number, String], default: null },  // 매매가(만원)
  premium: { type: [Number, String], default: null },    // 권리금(만원)
  areaPyeong: { type: [Number, String], default: null }, // 평
  location: { type: String, default: '' }                // "제주시 애월읍"
})

const imageSrc = computed(
  () => props.img || 'https://placehold.co/600x600?text=STORE'
)

/** 만원 포맷 */
function formatManwonOrNone(v) {
  if (v === null || v === undefined || v === '') return '없음'
  const n = Number(v)
  if (!Number.isFinite(n)) return '없음'
  const eok = Math.floor(n / 10000)
  const man = n % 10000
  return eok > 0 ? `${eok}억 ${man.toLocaleString()}` : man.toLocaleString()
}

const depositText = computed(() => formatManwonOrNone(props.deposit))
const rentText    = computed(() => formatManwonOrNone(props.rent))
const saleText    = computed(() => formatManwonOrNone(props.salePrice))
const premiumText = computed(() => formatManwonOrNone(props.premium))

/** 한 줄 문자열로 만들어 말줄임 적용 */
const titleLine = computed(() => {
  if (props.dealType === '월세' || props.dealType === '임대') {
    return `월세 ${depositText.value}/${rentText.value}`
  }
  // 매매
  return `매매 ${saleText.value}${rentText.value !== '없음' ? ` ${rentText.value}` : ''}`
})

const metaLine = computed(() => {
  const left = props.areaPyeong != null ? `${props.areaPyeong}평` : null
  const right = props.location || null
  if (!left && !right) return '없음'
  return [left, right].filter(Boolean).join(' · ')
})
</script>

<style scoped>
.listing-card.grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 16px;
  background: var(--color-white);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
}

.thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
  background: var(--color-lightgray);
  display: block;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 96px;
}

.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;        
  min-width: 0;      
}

.badge {
  align-self: flex-start;  
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
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
  line-height: 1.2;
  color: var(--color-black);
  min-height: 20px; 
}

.premium {
  color: var(--color-primary);
  min-height: 18px;
}

.meta {
  color: var(--color-darkgray);
  min-height: 18px;
}

.listing-card-link {
  text-decoration: none;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
  display: block;
}
</style>
