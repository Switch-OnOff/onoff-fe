<template>
  <div class="login-page">
    <img class="login-logo-img" :src="loginLogo" alt="로그인 로고" />

    <form @submit.prevent="onLogin" class="login-form">
      <!-- 이메일 -->
      <InputSimple
        v-model="username"
        type="text"
        placeholder="이메일을 입력하세요."
        autocomplete="username"
      />

      <!-- 비밀번호 -->
      <div class="password-wrapper">
        <InputSimple
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="비밀번호를 입력하세요."
          autocomplete="current-password"
        />
        <button
          class="showPassword-btn"
          type="button"
          @click.stop="toggleShowPassword"
          :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'"
        >
          <img
            :src="showPassword ? eyeOpen : eyeClosed"
            class="showPassword-icon"
            :alt="showPassword ? '비밀번호 표시 중' : '비밀번호 숨김 중'"
          />
        </button>
      </div>

      <LgSubmitBtn class="login-btn" type="submit" text="로그인" />
    </form>

    <div class="login-links bodyMedium16px">
      <button class="link-btn bodyMedium16px" @click="onSignup">
        회원가입하기
      </button>
      <button class="link-btn bodyMedium16px" @click="onResetPw">
        비밀번호찾기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import InputSimple from "@/components/input/InputSimple.vue";
import LgSubmitBtn from "@/components/button/LgSubmitBtn.vue";
import loginLogo from "@/assets/icons/logo.png";
import axios from "axios";

// 아이콘
import eyeOpen from "@/assets/icons/pw_show_eye.png";   // 표시(열린 눈)
import eyeClosed from "@/assets/icons/pw_hide_eye.png"; // 숨김(가린 눈)

const router = useRouter();
const route = useRoute();

const username = ref("");
const password = ref("");
const showPassword = ref(false);

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

async function onLogin() {
  if (!username.value || !password.value) {
    alert("아이디와 비밀번호를 모두 입력해주세요.");
    return;
  }

  // 백엔드 연동 주석 처리
  /*
  try {
    const response = await axios.post("/api/auth/login", {
      username: username.value,
      password: password.value,
    });

    const token = response.data.token;
    const userData = response.data.user;

    if (token && userData) {
      // authStore.login(userData, token);
      // checklistStore.checklistData.userId = userData.userId;
      // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      alert("로그인 성공!");
      const redirectPath = route.query.redirect || "/";
      router.push(redirectPath);
    } else {
      alert("로그인 정보가 올바르지 않습니다.");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "로그인에 실패했습니다.\n아이디나 비밀번호를 확인해주세요.";
    alert(errorMessage);
  }
  */
  
  // 데모 모드 - 로그인 성공 시 홈으로 이동
  alert("로그인 시도: " + username.value);
  const redirectPath = route.query.redirect || "/";
  router.push(redirectPath);
}

function onSignup() {
  router.push("/auth/signup-agreement");
}

function onResetPw() {
  router.push("/auth/reset-password");
}
</script>

<style scoped>
.login-page {
  margin: 2rem;
  padding-top: 30px;
}

.login-logo-img {
  display: block;
  width: 180px;
  object-fit: cover;
  margin: 6rem auto 2.5rem auto;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.password-wrapper {
  display: flex;
  position: relative;
  align-items: center;
}

.showPassword-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.showPassword-icon {
  position: absolute;
  right: 13px;
  top: 13px;
  width: 24px;
  height: 24px;
}

.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
}

.login-links {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 52px;
}

.link-btn {
  color: var(--color-mediumgray);
  cursor: pointer;
  padding: 0 4px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
