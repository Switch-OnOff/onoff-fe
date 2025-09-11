<template>
  <button
    type="button"
    class="seg"
    :class="{ on: isOn }"
    :style="styleVars"
    @click="toggle"
    :title="`현재: ${isOn ? rightText : leftText}`"
  >
    <span class="knob">
      <span class="txt bodySemiBold14px">{{ isOn ? rightText : leftText }}</span>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** v-model 값: 'TRANSFER' | 'SUCCESSION' */
  modelValue: { type: String, default: 'TRANSFER' },

  /** 핸들 안 텍스트 */
  leftText:  { type: String, default: '양도' },
  rightText: { type: String, default: '승계' },

  /** 크기(숫자 px) — 폭/높이만 조절하면 나머지는 자동 계산 */
  w: { type: Number, default: 56 }, // 줄이고 싶으면 52, 48 등으로
  h: { type: Number, default: 32 }, // 28~36 선 추천

  /** 색상(프로젝트 토큰 그대로 사용 가능) */
  onColor:   { type: String, default: 'var(--color-primary)' },
  offColor:  { type: String, default: 'var(--color-primary)' },
  handleBg:  { type: String, default: 'var(--color-white)' },
  textColor: { type: String, default: 'var(--color-black)' },
})

const emit = defineEmits(['update:modelValue','change'])

const isOn = computed(() => props.modelValue === 'SUCCESSION')
const slide = computed(() => `${props.w - props.h}px`)

const styleVars = computed(() => ({
  '--w': `${props.w}px`,
  '--h': `${props.h}px`,
  '--r': `${props.h / 2}px`,
  '--slide': slide.value,
  '--on': props.onColor,
  '--off': props.offColor,
  '--handle': props.handleBg,
  '--text': props.textColor,
}))

function toggle() {
  const next = isOn.value ? 'TRANSFER' : 'SUCCESSION'
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<style scoped>
.seg {
  position: relative;
  width: var(--w);
  height: var(--h);
  padding: 2px;            
  border: 0;
  border-radius: var(--r);
  background: var(--off);
  cursor: pointer;
  transition: var(--transition);
  touch-action: manipulation; 
}
.seg.on { background: var(--on); }

.knob {
  position: absolute;
  top: 2px; left: 2px;
  width: calc(var(--h) - 4px);
  height: calc(var(--h) - 4px);
  background: var(--handle);
  border-radius: 9999px;
  box-shadow: 0 1px 2px rgba(0,0,0,.15);
  display: flex; align-items: center; justify-content: center;
  transform: translateX(0);
  transition: var(--transition);
}
.seg.on .knob { transform: translateX(var(--slide)); }

.txt {
  line-height: 1;
  white-space: nowrap;
}
</style>
