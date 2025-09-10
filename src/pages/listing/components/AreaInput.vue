<template>
  <div class="area-card">
    <!-- 상단 단위 세그먼트 -->
    <div class="seg seg-2" role="tablist" aria-label="면적 단위">
      <button
        type="button"
        class="seg-btn bodyMedium14px"
        :class="{ active: mode === 'm2' }"
        :aria-pressed="mode === 'm2'"
        @click="mode = 'm2'"
      >
        m²
      </button>
      <button
        type="button"
        class="seg-btn bodyMedium14px"
        :class="{ active: mode === 'pyeong' }"
        :aria-pressed="mode === 'pyeong'"
        @click="mode = 'pyeong'"
      >
        평
      </button>
    </div>

    <!-- 본문: 입력 영역 -->
    <div class="area-body">
      <!-- m² 모드 -->
      <div class="grid" v-if="mode === 'm2'">
        <div>
          <input
            class="input"
            v-model.number="m2SupplyLocal"
            inputmode="decimal"
            placeholder="공급 m²"
          />
          <p class="hint bodyRegular12px" v-if="m2SupplyLocal">
            ≈ {{ toPyeong(m2SupplyLocal) }} 평
          </p>
        </div>
        <div>
          <input
            class="input"
            v-model.number="m2ExclusiveLocal"
            inputmode="decimal"
            placeholder="전용 m²"
          />
          <p class="hint bodyRegular12px" v-if="m2ExclusiveLocal">
            ≈ {{ toPyeong(m2ExclusiveLocal) }} 평
          </p>
        </div>
      </div>

      <!-- 평 모드 -->
      <div class="grid" v-else>
        <div>
          <input
            class="input"
            v-model.number="pSupply"
            inputmode="decimal"
            placeholder="공급 평"
          />
          <p class="hint bodyRegular12px" v-if="pSupply">
            ≈ {{ toM2(pSupply) }} m²
          </p>
        </div>
        <div>
          <input
            class="input"
            v-model.number="pExclusive"
            inputmode="decimal"
            placeholder="전용 평"
          />
          <p class="hint bodyRegular12px" v-if="pExclusive">
            ≈ {{ toM2(pExclusive) }} m²
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const M2_PER_PYEONG = 3.305785

const props = defineProps({
  m2Supply: Number,
  m2Exclusive: Number
})
const emit = defineEmits(['update:m2Supply', 'update:m2Exclusive'])

const mode = ref('m2')

const m2SupplyLocal = ref(props.m2Supply ?? null)
const m2ExclusiveLocal = ref(props.m2Exclusive ?? null)
const pSupply = ref(null)
const pExclusive = ref(null)

/* 외부로 m² 값 반영 */
watch(m2SupplyLocal, v => emit('update:m2Supply', v))
watch(m2ExclusiveLocal, v => emit('update:m2Exclusive', v))

/* 평 입력 시 m² 실시간 변환(평 모드에서만) */
watch(pSupply, v => { if (mode.value === 'pyeong') m2SupplyLocal.value = toM2(v) })
watch(pExclusive, v => { if (mode.value === 'pyeong') m2ExclusiveLocal.value = toM2(v) })

/* 모드 전환 시 보이는 입력값 자연스러운 동기화 */
watch(mode, (v) => {
  if (v === 'pyeong') {
    pSupply.value = m2SupplyLocal.value ? toPyeongNumber(m2SupplyLocal.value) : null
    pExclusive.value = m2ExclusiveLocal.value ? toPyeongNumber(m2ExclusiveLocal.value) : null
  }
})

function toPyeong(m2) {
  const n = Number(m2); if (!Number.isFinite(n)) return '-'
  return (n / M2_PER_PYEONG).toFixed(1)
}
function toPyeongNumber(m2) {
  const n = Number(m2); if (!Number.isFinite(n)) return null
  return Number((n / M2_PER_PYEONG).toFixed(1))
}
function toM2(p) {
  const n = Number(p); if (!Number.isFinite(n)) return null
  // 소수 1자리 반올림
  return Math.round(n * M2_PER_PYEONG * 10) / 10
}
</script>

<style scoped>
/* 카드로 ‘한 세트’ 느낌 */
.area-card{
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
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
.area-body{ padding: 12px; }

/* 입력 그리드 */
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.input{
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: var(--color-white);
  font: inherit;
  box-sizing: border-box;
}
.input:focus { border-color: var(--color-primary); outline: none; }

.hint { color: var(--color-darkgray); margin-top: 4px; }
</style>
