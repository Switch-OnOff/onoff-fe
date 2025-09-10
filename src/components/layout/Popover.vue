<template>
  <div v-if="visible" class="popover-wrapper" @click.self="close">
    <div class="popover-box">
      <div
        v-for="(item, index) in options"
        :key="index"
        class="popover-item"
        @click="select(item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  options: { type: Array, default: () => [] },
});

const emit = defineEmits(['select', 'close']);

const select = (item) => {
  emit('select', item);
  emit('close');
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
.popover-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent; /* 배경 클릭 시 닫히도록 */
  z-index: 200;
}

.popover-box {
  position: absolute;
  top: 50px; /* Header 높이 맞춤 */
  right: 16px;
  width: 100px;
  background-color: #fff;
  border: 0.5px solid var(--color-lightgray);
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.popover-item {
  padding: 5px 10px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-lightgray);
}

.popover-item:last-child {
  border-bottom: none;
}

.popover-item:hover {
  background-color: var(--color-primary-10);
}
</style>
