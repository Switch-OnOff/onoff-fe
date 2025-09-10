<template>
  <div class="parking-card">
    <!-- 상단 세그먼트 불가 / 가능 -->
    <div class="seg seg-2" role="tablist" aria-label="주차 가능 여부">
      <button
        type="button"
        class="seg-btn bodyMedium14px"
        :class="{ active: typeLocal === '불가' }"
        :aria-pressed="typeLocal === '불가'"
        @click="typeLocal = '불가'"
      >
        불가
      </button>
      <button
        type="button"
        class="seg-btn bodyMedium14px"
        :class="{ active: typeLocal === '가능' }"
        :aria-pressed="typeLocal === '가능'"
        @click="typeLocal = '가능'"
      >
        가능
      </button>
    </div>

    <!-- 주차 가능일 때만 -->
    <div class="parking-body" v-if="typeLocal === '가능'">
      <div class="grid-2">
        <input
          class="input"
          v-model.number="countLocal"
          inputmode="numeric"
          placeholder="대수"
        />

        <!-- 요금 칩 토글 -->
        <div class="pay-toggle" role="tablist" aria-label="주차 요금">
          <button
            type="button"
            class="chip bodyMedium12px"
            :class="{ active: paidLocal === false }"
            :aria-pressed="paidLocal === false"
            @click="paidLocal = false"
          >
            <span class="chip-icon" aria-hidden="true">✓</span>
            무료
          </button>
          <button
            type="button"
            class="chip bodyMedium12px"
            :class="{ active: paidLocal === true }"
            :aria-pressed="paidLocal === true"
            @click="paidLocal = true"
          >
            <span class="chip-icon bodyMedium12px" aria-hidden="true">₩</span>
            유료
          </button>
        </div>
      </div>

      <!-- 선택 요약 -->
      <p class="hint bodyRegular12px" v-if="countLocal !== null && countLocal !== undefined">
        최대 {{ countLocal }}대 · {{ paidLocal ? '유료' : '무료' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** '불가' | '가능' | '' */
  type: { type: String, default: '' },
  /** 주차 대수 */
  count: { type: Number, default: null },
  /** 유료 여부 */
  paid: { type: Boolean, default: false },
})

const emit = defineEmits(['update:type', 'update:count', 'update:paid'])

const typeLocal = computed({
  get: () => props.type,
  set: v => emit('update:type', v),
})
const countLocal = computed({
  get: () => props.count,
  set: v => emit('update:count', toNumOrNull(v)),
})
const paidLocal = computed({
  get: () => props.paid,
  set: v => emit('update:paid', Boolean(v)),
})

function toNumOrNull(v) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, n) : null
}
</script>

<style scoped>
/* 카드로 ‘한 세트’ 느낌 */
.parking-card{
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-white);
}

/* 상단 세그먼트(탭) */
.seg {
  display: grid;
  border-bottom: 1px solid var(--color-lightgray);
}
.seg-2 { grid-template-columns: repeat(2, 1fr); }
.seg-btn{
  padding: 10px 12px;
  background: #fff;
  border: 0;
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.seg-btn + .seg-btn { border-left: 1px solid var(--color-lightgray); }
.seg-btn:hover { background: var(--color-primary-10); }
.seg-btn.active{
  background: var(--color-primary-10);
  color: var(--color-primary);
  font-weight: 600;
}

/* 본문 패딩 */
.parking-body{ padding: 12px; }

/* 입력 그리드 */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

/* 인풋 공통 */
.input{
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 8px;
  background: #fff;
  font: inherit;
  box-sizing: border-box;
}
.input:focus { border-color: var(--color-primary); outline: none; }

.pay-toggle{
  display: flex;
  gap: 8px;
  align-items: center;
}
.chip{
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-lightgray);
  background: #fff;
  color: var(--color-black);
  cursor: pointer;
  transition: background .15s ease, color .15s ease, border-color .15s ease, box-shadow .15s ease;
}
.chip.active{
  background: var(--color-primary-10);
  border-color: var(--color-primary);
  box-shadow: 0 1px 0 rgba(0,0,0,.02), 0 2px 8px rgba(0,0,0,.06);
}
.chip-icon{
  line-height: 1;
  opacity: .9;
}

.hint { color: var(--color-darkgray); margin-top: 6px; }
</style>
