<template>
  <div class="cta" :style="{ '--cta-reserve': reserveBottom + 'px' }">
    <button class="btn bodyMedium18px" @click="$emit('click')">
      {{ label }}
    </button>
    <slot name="below"></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, default: '다음' },
  reserveBottom: { type: Number, default: 0 },
});
defineEmits(['click']);
</script>

<style scoped>
.cta {
  position: sticky;
  bottom: 0;
  background: var(--color-white);

  /* 가로는 0으로 두고, 페이지의 .px로만 통일 관리 */
  padding: 0.75rem 0
    calc(0.5rem + var(--cta-reserve, 0px) + env(safe-area-inset-bottom));

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn {
  width: 100%;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: var(--color-primary);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
