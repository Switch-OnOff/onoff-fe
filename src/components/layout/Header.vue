<template>
  <header class="base-header">
    <!-- 좌측 로고 -->
    <div class="left">
      <img
        class="logo"
        :src="logo"
        alt="앱 로고"
      />
    </div>

    <!-- 우측 슬롯 (알림, 설정 등 확장 가능) -->
    <div class="right">
      <slot name="right"></slot>
    </div>
  </header>
</template>

<script setup>
import logo from '@/assets/icons/logo.png'
</script>

<style scoped>
.base-header {
  width: 100%;
  max-width: 393px;       /* iPhone 16 Pro 기준 */
  height: 56px;           /* 모바일 헤더 높이 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-lightgray);
}

.left {
  display: flex;
  align-items: center;
}

.logo {
  height: 36px;
  width: auto;
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
