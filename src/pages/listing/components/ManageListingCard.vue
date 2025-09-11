<template>
  <div class="manage-card" @click="goDetail">
    <!-- 썸네일 -->
    <div class="thumb-wrap">
      <img :src="imageSrc" alt="매물 썸네일" class="thumb" @error="onImgError" />
      <span v-if="status" class="status-badge" :data-status="status">{{ status }}</span>
    </div>

    <!-- 본문 -->
    <div class="content">
      <div class="title-row">
        <!-- ③ 업종 카테고리로 표시 -->
        <h3 class="title bodySemiBold16px">
          {{ industry || '업종 미지정' }}
        </h3>
        <!-- ③-1 최근 수정(업데이트 라벨) 표시 삭제 -->
      </div>

      <!-- 가격 -->
      <div class="line bodySemiBold16px">
        <template v-if="transactionType === '월세' || transactionType === '임대'">
          월세 {{ depositText }}/{{ rentText }}
        </template>
        <template v-else>
          매매 {{ saleText }}
        </template>
      </div>

      <!-- ④ 권리금 강조 (색상 + bodyMedium14px) -->
      <div class="premium bodyMedium14px premium-emph" v-if="premium != null">
        권리금 {{ premiumText }}
      </div>

      <!-- ⑤ 평수 삭제 / ⑥ 주소는 다음 줄로 -->
      <div class="address bodyRegular14px" v-if="location">
        {{ location }}
      </div>
    </div>

    <!-- 하단 액션 -->
    <div class="actions">
      <button class="btn ghost" type="button" @click.stop="onEdit">수정</button>
      <button class="btn danger" type="button" @click.stop="onDelete">삭제</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import fallbackThumb from '@/assets/images/fallback-image.png' // ④ 폴백 이미지 교체

const emit = defineEmits(['edit', 'delete', 'click'])

const props = defineProps({
  /* ListingCard.vue와 호환되는 스키마 */
  id: { type: [Number, String], required: true },
  img: { type: String, default: '' },
  industry: { type: String, default: '' },
  transactionType: { type: String, default: '월세' }, // '월세' | '매매' | '임대'
  deposit: { type: [Number, String], default: null },   // 만원
  rent: { type: [Number, String], default: null },      // 만원
  salePrice: { type: [Number, String], default: null }, // 만원
  premium: { type: [Number, String], default: null },   // 만원
  exclusiveArea: { type: [Number, String], default: null }, // 평 (사용 안 함)
  location: { type: String, default: '' },

  /* 관리 페이지 전용(선택) */
  storeName: { type: String, default: '' }, // (표시는 안하지만 호환 유지)
  status: { type: String, default: '' },    // '게시중' | '검수중' | '숨김'
  updatedAt: { type: String, default: '' }, // (표시 제거)
})

/* ④ 폴백 이미지 사용 */
const imageSrc = computed(() => props.img || fallbackThumb)
function onImgError(e) { e.target.src = fallbackThumb }

/* 금액 포맷 (만원 → "3억 5,000") */
function formatManwon(v) {
  if (v === null || v === undefined || v === '') return '없음'
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return '없음'
  const eok = Math.floor(n / 10000)
  const man = n % 10000
  if (eok > 0) return man > 0 ? `${eok}억 ${man.toLocaleString()}` : `${eok}억`
  return man > 0 ? man.toLocaleString() : '없음'
}
const depositText = computed(() => formatManwon(props.deposit))
const rentText = computed(() => formatManwon(props.rent))
const saleText = computed(() => formatManwon(props.salePrice))
const premiumText = computed(() => formatManwon(props.premium))

function goDetail() { emit('click', props.id) }
function onEdit() { emit('edit', props.id) }
function onDelete() { emit('delete', props.id) }
</script>

<style scoped>
.manage-card {
  display: grid;
  grid-template-columns: 108px 1fr;
  grid-template-areas:
    "thumb content"
    "actions actions";
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 14px;
  background: var(--color-white);
  align-items: stretch; /* ② 오른쪽 텍스트 높이에 맞춰 썸네일도 늘어남 */
}

/* ② 이미지 높이를 우측 텍스트 높이와 동일하게 */
.thumb-wrap {
  grid-area: thumb;
  position: relative;
  width: 108px;
  min-height: 88px;
  align-self: stretch;     /* 같은 행의 높이를 꽉 채우기 */
  overflow: hidden;
  border-radius: 12px;
  background: var(--color-lightgray);
}
.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.status-badge {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-white);
  background: var(--color-darkgray);
}
.status-badge[data-status="게시중"] { background: var(--color-primary); }
.status-badge[data-status="검수중"] { background: #888; }
.status-badge[data-status="숨김"]   { background: #bbb; color: #232323; }

.content {
  grid-area: content;
  display: grid;
  gap: 6px;
  min-width: 0;
}
.title-row {
  display: grid;
  grid-template-columns: 1fr; /* ③ 최근수정 제거로 한 칸만 */
  align-items: center;
  gap: 8px;
}
.title {
  margin: 0;
  color: var(--color-black);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.line { color: var(--color-black); }

/* ④ 권리금 강조 */
.premium-emph { color: var(--color-primary); }

.address { color: var(--color-darkgray); }

/* 하단 액션 */
.actions {
  grid-area: actions;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
/* ⑤ 버튼 높이 줄임 */
.btn {
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--color-lightgray);
  background: var(--color-white);
  color: var(--color-lightblack);
  cursor: pointer;
  width: 100%;
  text-align: center;
}
.btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.btn.danger { border-color: #e35d5d; color: #e35d5d; }
.btn.danger:hover { background: #fff1f1; }
.btn.ghost { }

@media (max-width: 420px) {
  .thumb-wrap { width: 96px; }
}
</style>
