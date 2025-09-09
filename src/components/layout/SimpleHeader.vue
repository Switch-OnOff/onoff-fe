<template>
  <header class="simple-header">
    <button
      v-if="props.showButton"
      class="back-btn"
      @click="goBack"
      aria-label="뒤로가기"
    >
      <img :src="leftArrow" alt="뒤로가기" class="arrow-img" />
    </button>
    <span class="header-title bodyMedium20px">{{ title }}</span>
    <slot name="action"></slot>
    <button
      v-if="props.showMoreButton"
      class="back-btn"
      @click="$emit('more-click')"
      aria-label="더보기"
    >
      <img :src="more" alt="더보기" class="more-img" />
    </button>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import leftArrow from '@/assets/icons/back.png';
import more from '@/assets/icons/more.png';

const props = defineProps({
  title: { type: String, required: true },
  showButton: { type: Boolean, default: true },
  showMoreButton: { type: Boolean, default: false },
});

const router = useRouter();

function goBack() {
  router.back();
}
</script>

<style scoped>
.simple-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--color-white);
  z-index: 100;
  max-width: 393px;
  width: 100%;
  margin: 0 auto;
  border-bottom: 0.5px solid var(--color-light);
  padding: 14px 0 14px 16px;
  border-bottom: 0.5px solid var(--color-lightgray);
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-right: 8px;
  display: flex;
  align-items: center;
  height: 100%;
}

.arrow-img {
  width: 20px;
  height: 20px;
  display: block;
}

.header-title {
  display: flex;
  flex: 1;
  align-items: center;
  color: var(--color-black);
  height: 100%;
  line-height: 60px;
  margin-left: 8px;
}

.more-img {
  width: 30px;
  height: 30px;
}
</style>
