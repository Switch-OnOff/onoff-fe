<!-- src/pages/financial/components/FilterSheet.vue -->
<template>
  <teleport to="body">
    <div v-if="open" class="overlay" @click.self="$emit('update:open', false)">
      <section class="sheet" role="dialog" aria-modal="true">
        <header class="sheet-head">
          <strong>필터</strong>
          <button class="close" @click="$emit('update:open', false)">
            닫기
          </button>
        </header>
        <div class="sheet-body">
          <slot />
        </div>
      </section>
    </div>
  </teleport>
</template>

<script setup>
const props = defineProps({ open: { type: Boolean, default: false } });
defineEmits(['update:open']);
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 50;
}
.sheet {
  width: 100%;
  background: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  max-height: 80vh;
  overflow: auto;
  animation: up 0.18s ease-out;
}
@keyframes up {
  from {
    transform: translateY(16px);
    opacity: 0.9;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.sheet-body {
  padding: 12px 0 16px;
}
.close {
  padding: 6px 10px;
  border-radius: 8px;
  background: #f5f5f5;
}
</style>
