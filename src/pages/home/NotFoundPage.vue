<template>
  <div class="not-found">
    <h1 class="titleExtra32px">404</h1>
    <p class="bodyRegular16px">페이지를 찾을 수 없습니다.</p>
    <router-link to="/" class="back-home bodyMedium16px">
      홈으로 돌아가기
    </router-link>
  </div>
</template>

<script setup>
// 별도 로직 없음
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  height: calc(100vh - 56px); /* 헤더 높이 제외 */
  text-align: center;
  padding: 16px;
}

.back-home {
  margin-top: 24px;
  padding: 12px 20px;
  border-radius: 8px;
  background-color: var(--color-primary);
  color: var(--color-white);
  text-decoration: none;
  transition: var(--transition);
}

.back-home:hover {
  background-color: var(--color-blue-deep);
}
</style>
