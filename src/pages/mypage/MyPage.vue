<template>
  <div>
    <SimpleHeader :show-button="false" title="마이페이지" />

    <div class="mypage-container">
      <!-- 프로필 영역 -->
      <div class="profile-box">
        <div class="profile-wrapper">
          <img class="profile-img" :src="profileImageSrc" alt="프로필" />
          <button class="edit-btn" @click="selectImage">
            <img class="pencil-icon" :src="PencilIcon" alt="편집" />
          </button>
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            @change="onFileChange"
            style="display: none"
          />
        </div>
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
        <label>문의</label>
      </div>
      <div class="menu-box">
        <img class="icon" :src="UserIcon" />
        <label>설정</label>
      </div>
    </div>
  </div>
</template>

<script setup>
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import UserIcon from '@/assets/icons/footer/user.png';
import ChatIcon from '@/assets/icons/footer/chat.png';
import PencilIcon from '@/assets/icons/mypage/pencil.png';
import { ref } from 'vue';

// 랜덤 초기 프로필 이미지
const profileImageSrc = ref(
  `https://picsum.photos/200?random=${Math.random()}`
);
const fileInput = ref(null);

// 버튼 클릭 시 파일 선택창 열기
const selectImage = () => {
  fileInput.value.click();
};

// 파일 선택 후 이미지 반영
const onFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    profileImageSrc.value = e.target.result; // 선택 즉시 반영
  };
  reader.readAsDataURL(file);
};
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

.profile-wrapper {
  position: relative;
  display: inline-block;
}

.profile-img {
  width: 100px;
  height: 100px;
  border: 2px solid var(--color-lightgray);
  border-radius: 50%;
  object-fit: cover;
}

.edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--color-lightgray);
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px;
  cursor: pointer;
}

.pencil-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
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
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
}

.icon {
  width: 25px;
  height: 25px;
}

.line {
  height: 1px;
  background-color: var(--color-light);
  margin: 0;
}
</style>
