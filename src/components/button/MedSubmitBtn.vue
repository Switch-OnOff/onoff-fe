<template>
  <button
    class="btn-med-wrapper bodyMedium18px"
    :class="{ 'white-bg': isWhiteBg }"
    :style="{ backgroundColor: isWhiteBg ? '#ffffff' : color }"
    type="button"
    @click="$emit('click')"
  >
    {{ text }}
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'var(--color-primary)',
  },
  text: {
    type: String,
    required: true,
  },
})

defineEmits(['click'])

const isWhiteBg = computed(() => {
  const c = (props.color || '').toLowerCase().replace(/\s/g, '')
  return c === '#fff' || c === '#ffffff' || c === 'white' || c === 'var(--color-white)'
})

</script>

<style scoped>
.btn-med-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 330px;
  height: 35px;    
  padding: 0;
  border: none;
  border-radius: 12px;
  text-align: center;
  line-height: 1;
  color: var(--color-white);
  cursor: pointer;
  transition: var(--transition);
}

.white-bg {
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
</style>
