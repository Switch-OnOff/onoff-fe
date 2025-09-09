<template>
  <div class="cta">
    <button class="btn bodyMedium18px" @click="$emit('click')">
      {{ label }}
    </button>
  </div>
</template>

<script setup>
defineProps({ label: { type: String, default: '다음' } });
defineEmits(['click']);
</script>

<style scoped>
.cta {
  position: sticky;
  bottom: 0;
  background: var(--color-white);
  padding: 0.75rem 1.25rem 0.5rem;
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
