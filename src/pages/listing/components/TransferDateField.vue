<template>
  <div class="transfer-card">
    <!-- 상단 옵션 세그먼트 -->
    <div class="seg seg-3">
      <button
        type="button"
        class="seg-btn bodyMedium14px"
        :class="{ active: typeLocal === '날짜' }"
        @click="typeLocal = '날짜'"
      >
        날짜 선택
      </button>
      <button
        type="button"
        class="seg-btn bodyMedium14px"
        :class="{ active: typeLocal === '협의' }"
        @click="typeLocal = '협의'"
      >
        협의 가능
      </button>
      <button
        type="button"
        class="seg-btn bodyMedium14px"
        :class="{ active: typeLocal === '즉시' }"
        @click="typeLocal = '즉시'"
      >
        바로 가능
      </button>
    </div>

    <!-- 날짜 입력 (세그먼트와 한 세트) -->
    <div v-if="typeLocal === '날짜'" class="date-row">
      <div class="date-field">
        <input
          ref="dateRef"
          class="date-input"
          type="date"
          v-model="dateLocal"
        />
        <!-- 커스텀 캘린더 아이콘 (오른쪽 정렬) -->
        <button
          type="button"
          class="calendar-btn"
          aria-label="달력 열기"
          @click="openPicker"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"
                  stroke="currentColor" stroke-width="1.8"/>
            <line x1="16" y1="2" x2="16" y2="6"
                  stroke="currentColor" stroke-width="1.8"/>
            <line x1="8" y1="2" x2="8" y2="6"
                  stroke="currentColor" stroke-width="1.8"/>
            <line x1="3" y1="10" x2="21" y2="10"
                  stroke="currentColor" stroke-width="1.8"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ type: String, date: String })
const emit = defineEmits(['update:type', 'update:date'])

const typeLocal = ref(props.type || '협의')
const dateLocal = ref(props.date || '')
const dateRef = ref(null)

watch(typeLocal, (v) => {
  emit('update:type', v)
  if (v !== '날짜') emit('update:date', '')
})
watch(dateLocal, (v) => emit('update:date', v))

function openPicker () {
  const el = dateRef.value
  if (!el) return
  // 크로미움/사파리 최신은 showPicker 지원
  if (typeof el.showPicker === 'function') el.showPicker()
  else el.focus()
}
</script>

<style scoped>
/* 카드 */
.transfer-card {
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

/* 세그먼트 */
.seg {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid var(--color-lightgray);
}
.seg-btn {
  padding: 10px 12px;
  background: #fff;
  border: 0;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.seg-btn + .seg-btn { border-left: 1px solid var(--color-lightgray); }
.seg-btn:hover { background: var(--color-primary-10); }
.seg-btn.active { background: var(--color-primary-10); color: var(--color-primary); font-weight: 600; }

/* 날짜 영역 */
.date-row { padding: 12px; }

/* 인풋 + 아이콘 래퍼 */
.date-field { position: relative; }

/* 기본 달력 아이콘 숨김(크롬/엣지 등) — 우리 버튼을 사용 */
.date-input::-webkit-calendar-picker-indicator { opacity: 0; }

/* 인풋 */
.date-input {
  width: 100%;
  height: 44px;
  padding: 0 44px 0 12px; /* 오른쪽 아이콘 영역 확보 */
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: var(--color-white);
  font: inherit;
  box-sizing: border-box;
}
.date-input:focus { border-color: var(--color-primary); outline: none; }

/* 오른쪽 커스텀 아이콘 버튼 */
.calendar-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: 0;
  background: transparent;
  color: var(--color-mediumgray);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
}
.calendar-btn:hover { color: var(--color-primary); }
</style>
