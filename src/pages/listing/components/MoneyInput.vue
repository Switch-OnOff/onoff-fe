<template>
  <div class="money-input">
    <input
      class="input-box bodyMedium16px"
      type="tel"
      inputmode="numeric"
      pattern="\d*"
      :value="display"
      @beforeinput="blockNonDigits"
      @paste="onPaste"
      @input="onInput"
      placeholder="숫자만"
      autocomplete="off"
    />

    <div v-if="hasQuickButtons" class="number-button-group bodyLight12px">
      <button
        v-for="(label, idx) in normalizedLabels"
        :key="idx"
        type="button"
        @click="quickAdd(normalizedAmounts[idx])"
      >
        {{ label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: [Number, String],
  quickLabels: { type: Array, default: () => [] },
  quickAmounts: { type: Array, default: () => [] },
  min: { type: Number, default: 0 },
  max: { type: Number, default: Infinity },
})
const emit = defineEmits(['update:modelValue'])

const num = computed(() => {
  const n = Number(props.modelValue)
  return Number.isFinite(n) ? n : 0
})

const display = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') return ''
  const n = Number(props.modelValue)
  return Number.isFinite(n) && n >= 0 ? (n ? n.toLocaleString('ko-KR') : '0') : ''
})

/** 키보드/붙여넣기 직전에 숫자 외 입력 차단 */
function blockNonDigits(e) {
  // 삭제/조합 입력은 허용
  if (e.inputType?.startsWith('delete') || e.inputType?.includes('Composition')) return
  const data = e.data ?? ''
  if (data && !/^\d+$/.test(data)) e.preventDefault()
}
function onPaste(e) {
  const text = (e.clipboardData || window.clipboardData).getData('text')
  if (!/^\d+$/.test(text)) e.preventDefault()
}

/** 인풋 후 즉시 정규화(숫자만 + 클램프) & 표시값도 강제 세팅 */
function onInput(e) {
  const digits = String(e.target.value || '').replace(/\D+/g, '')
  let next = digits ? Number(digits) : null
  if (next !== null) next = clamp(next, props.min, props.max)

  // 화면상의 값도 즉시 콤마로 반영 (부드러운 UX)
  e.target.value = digits ? Number(digits).toLocaleString('ko-KR') : ''

  emit('update:modelValue', next)
}

const hasQuickButtons = computed(
  () =>
    Array.isArray(props.quickLabels) &&
    Array.isArray(props.quickAmounts) &&
    props.quickLabels.length > 0 &&
    props.quickAmounts.length > 0
)
const normalizedLen = computed(() =>
  hasQuickButtons.value ? Math.min(props.quickLabels.length, props.quickAmounts.length) : 0
)
const normalizedLabels = computed(() => props.quickLabels.slice(0, normalizedLen.value))
const normalizedAmounts = computed(() => props.quickAmounts.slice(0, normalizedLen.value))

function quickAdd(amount) {
  const base = Number.isFinite(Number(props.modelValue)) ? Number(props.modelValue) : 0
  const next = clamp(base + (Number(amount) || 0), props.min, props.max)
  emit('update:modelValue', next)
}

function clamp(v, min, max) { return Math.min(Math.max(v, min), max) }
</script>

<style scoped>
.money-input { display: block; }

.input-box {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: 1px solid var(--color-lightgray);
  padding: 0 16px;
  box-sizing: border-box;
  background: var(--color-white);
  transition: border 0.2s;
}
.input-box:focus { border-color: var(--color-primary); outline: none; }
.input-box::placeholder { color: var(--color-mediumgray); }

.number-button-group {
  display: flex;
  gap: 8px;
  margin: 8px 0 0;
}
.number-button-group button {
  flex: 1;
  padding: 8px 0;
  border-radius: 12px;
  border: 1px solid var(--color-light);
  cursor: pointer;
  background-color: var(--color-white);
  transition: background-color 0.2s ease, color 0.2s ease, border 0.2s ease;
  color: var(--color-text);
}
.number-button-group button:hover {
  border: 1.2px solid var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-10);
}
</style>
