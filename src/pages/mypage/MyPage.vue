<template>
  <div>
    <SimpleHeader :show-button="false" title="마이페이지" />

    <div class="mypage-container">
      <!-- 프로필 영역 -->
      <div class="profile-box">
        <img class="profile-img" :src="profileImageSrc" alt="프로필" />
        <div class="profile-info">
          <div class="profile-name titleBold20px">사용자</div>
          <div class="profile-email bodyMedium14px">
            <span class="emoji">📧 </span>user@gmail.com
          </div>
        </div>
      </div>
    </div>
    <div class="line"></div>
    <div class="menu-wrapper">
      <div class="menu-box">
        <img class="icon" :src="UserIcon" />
        <label>회원정보</label>
      </div>
      <div class="menu-box">
        <img class="icon" :src="ChatIcon" />
        <label>회원정보</label>
      </div>
      <div class="menu-box">
        <img class="icon" :src="UserIcon" />
        <label>회원정보</label>
      </div>
    </div>
  </div>
</template>

<script setup>
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import UserIcon from '@/assets/icons/footer/user.png';
import ChatIcon from '@/assets/icons/footer/chat.png';
import { ref } from 'vue';

// ✅ 랜덤 이미지 URL을 저장할 반응형 변수를 생성합니다.
const profileImageSrc = ref(
  `https://picsum.photos/200?random=${Math.random()}`
);
</script>

<style scoped>
.mypage-container {
  width: 100%;
  box-sizing: border-box;
}

.profile-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 32px 0 24px 0;
  border-bottom: 1px solid var(--color-light);
}

.profile-img {
  width: 100px;
  height: 100px;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  background: var(--color-white);
  object-fit: cover;
}

.profile-info {
  display: flex;
  flex-direction: column;
  color: var(--color-primary);
  gap: 1px;
  margin-top: 0.5rem;
}

.menu-wrapper {
  margin-top: 3rem;
}

.menu-box {
  /* border-top: 1px solid var(--color-lightgray);
  border-bottom: 1px solid var(--color-lightgray); */

  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.icon {
  width: 25px;
  height: 25px;
}
</style>
