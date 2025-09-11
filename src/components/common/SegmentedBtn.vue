<template>
  <button :class="['segmented-btn', { active: props.active }]"><slot /></button>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.segmented-btn {
  color: var(--color-black);
  padding: 0.5rem 1rem;
  border-radius: 5rem;
  border: 1px solid var(--color-lightgray);
}

.segmented-btn.active {
  color: var(--color-white);
  background-color: var(--color-primary);
}
</style>
