<template>
  <div v-if="open">
    <div class="sheet-backdrop" @click="$emit('close')" />
    <div
      class="sheet"
      @keydown.esc="$emit('close')"
      role="dialog"
      aria-modal="true"
    >
      <div class="sheet-header bodyBold16px">
        <strong>{{ title }} {{ items.length }}건</strong>
        <button class="sheet-close" @click="$emit('close')" aria-label="닫기">×</button>
      </div>

      <ul class="sheet-list">
        <li v-for="it in items" :key="it.id" class="sheet-item">
          <button class="row" type="button" @click="$emit('select', it.id)">
            <img
              class="thumb"
              :src="it.thumbnail"
              alt=""
              loading="lazy"
              @error="onImgError"
            />
            <div class="info">
              <!-- industry 배지 스타일 적용 -->
              <div class="title badge bodySemiBold14px">{{ it.industry || '-' }}</div>
              <div class="price bodySemiBold14px">{{ priceText(it) }}</div>
              <div class="addr bodyRegular12px">{{ it.address }}</div>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, required: true },
  items: { type: Array, default: () => [] },
  title: { type: String, default: '이 지역 매물' },
})
defineEmits(['close', 'select'])

function fmtMan(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '-'
  const eok = Math.floor(v / 10000)            // 억
  const man = v % 10000                         // 만원
  const manStr = man.toLocaleString('ko-KR')
  return eok > 0 ? `${eok}억 ${manStr}` : manStr
}

function priceText(it) {
  if (it?.transactionType === 'SALE') {
    // 예: "매매 3억 5,000"
    return `매매 ${fmtMan(it?.salePrice)}`
  }
  // 예: "월세 7,000/60"
  return `월세 ${fmtMan(it?.deposit)}/${fmtMan(it?.monthlyRent)}`
}

function onImgError(e) {
  e.target.src = 'https://placehold.co/240x160?text=IMG'
}
</script>

<style scoped>
.sheet-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 1100;
}

.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 60%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -8px 20px rgba(0, 0, 0, 0.18);
  z-index: 1110;
  display: flex;
  flex-direction: column;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-lightgray);
}

.sheet-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--color-lightgray);
  background: var(--color-white);
  cursor: pointer;
}

.sheet-list {
  overflow: auto;
  padding: 8px 8px 12px;
  margin: 0;
  list-style: none;
}

.sheet-item + .sheet-item {
  margin-top: 8px;
}

.row {
  width: 100%;
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 10px;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-lightgray);
  padding: 8px;
  text-align: left;
  cursor: pointer;

  /* 중앙 정렬 추가 */
  align-items: center;
}

.thumb {
  width: 96px;
  height: 72px;
  object-fit: cover;
  border-radius: 4px;
}

.info {
  /* 텍스트 블록을 세로 중앙정렬 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

/* 텍스트 컬러: 검정 */
.info .price {
  color: var(--color-black);
}
.info .addr {
  color: var(--color-darkgray);
}

/* industry 배지 스타일 */
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
</style>
