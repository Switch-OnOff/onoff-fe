<!-- src/pages/financial/components/ModeTabs.vue -->
<template>
  <div class="tabs">
    <button
      :class="['tab', { active: model === 'loan' }]"
      @click="$emit('update:model', 'loan')"
    >
      대출
    </button>
    <button
      :class="['tab', { active: model === 'support' }]"
      @click="$emit('update:model', 'support')"
    >
      지원금
    </button>
  </div>
</template>

<script setup>
defineProps({ model: { type: String, required: true } });
defineEmits(['update:model']);
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 2rem;
  padding: 0 1.25rem;
  align-items: flex-end;
  border-bottom: 1px solid #eee;
}
.tab {
  position: relative;
  padding: 12px 0;
  font-weight: 700;
  color: var(--color-darkgray);
  display: inline-block;
}
.tab.active {
  color: var(--color-primary);
}
.tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  border-radius: 3px;
  background: var(--color-primary);
  transform: translateY(1px); /* 시각적 보정 */
}
</style>
