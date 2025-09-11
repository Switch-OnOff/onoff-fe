<template>
  <header class="base-header">
    <!-- 좌측 로고 -->
    <div class="left">
      <img class="logo" :src="logo" alt="앱 로고" />
    </div>

    <!-- 우측 슬롯 (알림, 설정 등 확장 가능) -->
    <div class="right">
      <SegmentedBtn v-if="!isLoginned" class="login-btn" @click="goToLogin"
        >로그인</SegmentedBtn
      >
      <SegmentedBtn v-else class="icon-btn"
        ><img :src="bellIcon" class="icon"
      /></SegmentedBtn>
    </div>
  </header>
</template>

<script setup>
import logo from '@/assets/icons/logo.png';
import SegmentedBtn from '@/components/common/SegmentedBtn.vue';
import bellIcon from '@/assets/icons/bell-icon.png';
import { onMounted, ref } from 'vue';
import { useRouter, onBeforeRouteUpdate } from 'vue-router';

const activeTab = ref('give'); // 기본 탭
const isLoginned = ref(false);

const router = useRouter();

onMounted(() => {
  const user = sessionStorage.getItem('user');
  isLoginned.value = user != null;
});

onBeforeRouteUpdate(() => {
  const user = sessionStorage.getItem('user');
  isLoginned.value = user != null;
});

const goToLogin = () => {
  router.push('/auth/login');
};
</script>

<style scoped>
.base-header {
  width: 100%;
  max-width: 393px; /* iPhone 16 Pro 기준 */
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-lightgray);

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  margin: 0 auto;
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

.btn-wrapper {
  border: 1px solid var(--color-darkgray);
  padding: 1px;
  background-color: var(--color-primary);
  color: #fff;
}

.option-btn {
  border-style: none !important;
  color: white;
  width: 30px;
  /* padding: 0.2rem 0.5rem !important; */
}

.option-btn.active {
  background-color: #fff !important;
  color: var(--color-primary) !important;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  color: var(--color-primary, var(--color-primary));
  background: var(--color-white);
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background-color: #fff;
  color: var(--color-primary);
}
</style>

<style scoped>
.btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 70px; /* 전체 길이 */
  height: 36px; /* 전체 높이 */
  background-color: var(--color-primary); /* 기본 배경 (남색) */
  border-radius: 50px; /* 양 끝 둥글게 */
  padding: 4px;
  position: relative;
  transition: background-color 0.3s ease;
}

.option-btn {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.3s ease;
}

/* 활성화된 버튼은 하얀 원으로 표시 */
.option-btn.active {
  background-color: #fff;
  color: var(--color-primary);
  border-radius: 50%;
}

.login-btn {
  padding: 6px 10px;
  border-radius: 10px;
}

.icon-btn {
  padding: 6px 10px;
  border: none;
}

.icon {
  width: 24px;
  height: 24px;
}
</style>
