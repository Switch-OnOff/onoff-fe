<!-- src/components/layout/SimpleHeader.vue -->
<template>
  <header class="simple-header">
    <!-- 뒤로가기 -->
    <button
      v-if="props.showButton"
      class="icon-btn"
      @click="goBack"
      aria-label="뒤로가기"
    >
      <img :src="leftArrow" alt="뒤로가기" class="arrow-img" />
    </button>

    <!-- 타이틀 -->
    <span class="header-title bodyMedium18px">{{ props.title }}</span>

    <!-- 우측 액션 영역: #right(신규) / #action(기존) 둘 다 지원 -->
    <div class="right">
      <slot name="right" />
      <slot name="action" />
      <button
        v-if="props.showMoreButton"
        class="icon-btn"
        @click="$emit('more-click')"
        aria-label="더보기"
      >
        <img :src="more" alt="더보기" class="more-img" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import leftArrow from '@/assets/icons/back.png'
import more from '@/assets/icons/more.png'

const props = defineProps({
  title: { type: String, required: true },
  showButton: { type: Boolean, default: true },
  showMoreButton: { type: Boolean, default: false },
})

defineEmits(['more-click'])

const router = useRouter()
function goBack() {
  router.back()
}
</script>

<style scoped>
.simple-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  max-width: 393px;
  width: 100%;
  height: var(--header-h, 60px);

  margin: 0 auto;
  padding: 0 16px;

  display: flex;
  align-items: center;
  gap: 8px;

  background-color: var(--color-white);
  border-bottom: 0.5px solid var(--color-lightgray);
  z-index: 100;
}

/* 좌/우 공용 아이콘 버튼 */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  height: 100%;
  min-width: 32px; /* 좌우 폭 확보하여 타이틀 흔들림 방지 */
}

.arrow-img {
  width: 20px;
  height: 20px;
  display: block;
}

.header-title {
  flex: 1;
  display: flex;
  align-items: center;
  color: var(--color-black);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 32px; /* 우측 영역도 최소 폭 확보 */
}

.more-img {
  width: 30px;
  height: 30px;
  display: block;
}
</style>
