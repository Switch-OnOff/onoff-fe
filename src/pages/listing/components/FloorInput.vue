<template>
  <div class="floor">
    <div class="grid-2">
      <!-- 지상/지하 드롭다운 -->
      <SelectField
        v-model="isBasementNum"
        :items="floorTypeItems"
        placeholder="지상/지하 선택"
      />
      <!-- 해당층 숫자 -->
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
import SelectField from '@/pages/listing/components/DropDown.vue'

const props = defineProps({
  isBasement: { type: Boolean, default: false },
  current: { type: Number, default: null },
  total: { type: Number, default: null },
  showTotal: { type: Boolean, default: false },
})
const emit = defineEmits(['update:isBasement', 'update:current', 'update:total'])

const floorTypeItems = [
  { label: '지상', value: 0 },
  { label: '지하', value: 1 },
]

// v-model <-> Boolean 변환용
const isBasementNum = computed({
  get: () => (props.isBasement ? 1 : 0),
  set: (v) => emit('update:isBasement', v === 1),
})

const currentLocal = computed({
  get: () => props.current,
  set: (v) => emit('update:current', toNumOrNull(v)),
})
const totalLocal = computed({
  get: () => props.total,
  set: (v) => emit('update:total', toNumOrNull(v)),
})

function toNumOrNull(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
</script>

<style scoped>
.floor { display: grid; gap: 8px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

/* 숫자 인풋 공통 */
.input{
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: var(--color-white);
  font: inherit;
  box-sizing: border-box;
  height: 50px;
}
.input:focus { border-color: var(--color-primary); outline: none; }
</style>
