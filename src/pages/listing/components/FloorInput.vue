<!-- src/pages/listing/components/FloorInput.vue -->
<template>
  <div class="floor">
    <div class="grid-3">
      <!-- 지상/지하 -->
      <SelectField
        v-model="isBasementNum"
        :items="floorTypeItems"
        placeholder="지상/지하 선택"
        aria-label="지상 또는 지하 선택"
      />
      <!-- 해당층 -->
      <input
        class="input"
        v-model.number="currentLocal"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="해당층(숫자)"
        aria-label="해당층 숫자 입력"
      />
      <!-- 전체층 -->
      <input
        class="input"
        v-model.number="totalLocal"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="전체층(숫자)"
        aria-label="전체층 숫자 입력"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SelectField from '@/pages/listing/components/DropDown.vue'

const props = defineProps({
  isBasement: { type: Boolean, default: false },
  current:    { type: Number,  default: null },
  total:      { type: Number,  default: null },
})
const emit = defineEmits(['update:isBasement', 'update:current', 'update:total'])

const floorTypeItems = [
  { label: '지상', value: 0 },
  { label: '지하', value: 1 },
]

// Boolean <-> number bridge
const isBasementNum = computed({
  get: () => (props.isBasement ? 1 : 0),
  set: (v) => emit('update:isBasement', v === 1),
})

function toPosIntOrNull(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  const i = Math.trunc(Math.abs(n))
  return i > 0 ? i : null
}

const totalLocal = computed({
  get: () => props.total,
  set: (v) => {
    const t = toPosIntOrNull(v)
    emit('update:total', t)
    if (!props.isBasement && t != null && props.current != null && props.current > t) {
      emit('update:current', t) // 지상일 때 전체층 줄이면 해당층 자동 보정
    }
  },
})

const currentLocal = computed({
  get: () => props.current,
  set: (v) => {
    let c = toPosIntOrNull(v)
    if (!props.isBasement && c != null && props.total != null) {
      c = Math.min(c, props.total) // 지상: 전체층 한도 내
    }
    emit('update:current', c)
  },
})
</script>

<style scoped>
.floor { display: grid; gap: 8px; }

/* 3칸 그리드: 넓은 화면에서는 1줄 3칸 */
.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* 세 칸 동일 너비 */
  gap: 8px;
  align-items: center;
}

/* 숫자 인풋 공통 */
.input {
  width: 100%;
  height: 50px;
  padding: 10px 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: var(--color-white);
  font: inherit;
  box-sizing: border-box;
}
.input:focus { border-color: var(--color-primary); outline: none; }
/* 한 줄 3칸 고정 */
.grid-3{
  display: grid;
  grid-template-columns: 100px 1fr 1fr; /* 1칸(지상/지하)은 고정 폭, 나머지는 가변 */
  gap: 8px;
  align-items: center;
  min-width: 0;
}

/* 혹시 더 좁은 화면에서 붙는 느낌이 들면 살짝만 줄여줘 */
@media (max-width: 360px){
  .grid-3{
    grid-template-columns: 90px 1fr 1fr;
    gap: 6px;
  }
}

/* 숫자 인풋 공통 (기존 유지) */
.input{
  width: 100%;
  height: 50px;
  padding: 10px 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: var(--color-white);
  font: inherit;
  box-sizing: border-box;
}
.input:focus { border-color: var(--color-primary); outline: none; }

</style>
