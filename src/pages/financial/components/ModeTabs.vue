<!-- src/pages/financial/components/ModeTabs.vue -->
<template>
  <div class="tabs">
    <button
      :class="[
        'tab',
        model === 'loan' ? 'active bodyBold20px' : 'bodyLight20px',
      ]"
      @click="$emit('update:model', 'loan')"
    >
      대출
    </button>
    <button
      :class="[
        'tab',
        model === 'support' ? 'active bodyBold20px' : 'bodyLight20px',
      ]"
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
  align-items: flex-end;
  padding: 0;
  border-bottom: 1px solid #eee;
}

.tab {
  position: relative; /* ← 이거 꼭 필요 */
  flex: 1 0 0;
  padding: 12px 0;
  text-align: center;
  background: transparent;
  color: var(--color-darkgray);
}

.tab.active {
  color: var(--color-primary);
}

.tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0; /* -1px 대신 0px으로 */
  height: 3px;
  border-radius: 3px;
  background: var(--color-primary);
}
</style>
