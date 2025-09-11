<template>
  <button type="button" class="square-btn bodyMedium16px" @click="go">
    <slot name="icon" />
    <span class="label">{{ label }}</span>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  label: { type: String, required: true },
  // 라우트 이름 또는 route location object
  to: { type: [String, Object], required: true },
})
const router = useRouter()
function go() {
  const dest = typeof props.to === 'string' ? { name: props.to } : props.to
  router.push(dest).catch(() => {})
}
</script>

<style scoped>
.square-btn {
  width: 164px;
  height: 140px;
  border-radius: 12px;
  background: #f4f4f4;
  border: 1px solid var(--color-lightgray);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px;
  color: var(--color-lightblack);
  transition: var(--transition);
}
.square-btn:active { transform: scale(.98); }
.label { display: block; }
</style>
