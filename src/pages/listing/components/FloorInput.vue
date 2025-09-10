<template>
  <div class="floor">
    <div class="grid-2">
      <select class="input" v-model="isBasementLocal">
        <option :value="false">지상</option>
        <option :value="true">지하</option>
      </select>
      <input
        class="input"
        v-model.number="currentLocal"
        inputmode="numeric"
        placeholder="해당층(숫자)"
      />
    </div>

    <!-- 전체층 입력은 필요 시만 표시 -->
    <input
      v-if="showTotal"
      class="input"
      v-model.number="totalLocal"
      inputmode="numeric"
      placeholder="전체층(숫자)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isBasement: { type: Boolean, default: false },
  current: { type: Number, default: null },
  total: { type: Number, default: null },
  showTotal: { type: Boolean, default: false }, // 기본 숨김
})
const emit = defineEmits(['update:isBasement', 'update:current', 'update:total'])

const isBasementLocal = computed({
  get: () => props.isBasement,
  set: v => emit('update:isBasement', v),
})
const currentLocal = computed({
  get: () => props.current,
  set: v => emit('update:current', toNumOrNull(v)),
})
const totalLocal = computed({
  get: () => props.total,
  set: v => emit('update:total', toNumOrNull(v)),
})

/** 힌트: 지상/지하 N층 (숫자 없으면 표시 안 함) */
const floorText = computed(() => {
  const n = Number(currentLocal.value)
  if (!Number.isFinite(n) || n <= 0) return ''
  return `${isBasementLocal.value ? '지하' : '지상'} ${n}층`
})

function toNumOrNull(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
</script>

<style scoped>
.floor { display: grid; gap: 8px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

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
</style>
