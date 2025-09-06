<template>
  <div class="root">
    <AuthTitle title="회원정보 입력" />
    <form class="signup-form" @submit.prevent="onSubmit">
      <!-- 이메일 -->
      <InputEmail
        v-model="email"
        label="이메일을 입력해주세요."
        :error="emailError"
        @check="checkEmailDuplicate"
      />

      <!-- 비밀번호/비밀번호 확인 -->
      <InputField
        label="비밀번호를 입력해주세요."
        :desc="'* 영문, 숫자, 특수문자 중 2종류 이상을 조합하여 8자리 이상'"
        :error="passwordError"
      >
        <input
          class="input-box-pw bodyMedium16px"
          type="password"
          v-model="password"
          placeholder="비밀번호를 입력하세요."
          autocomplete="new-password"
          style="margin-bottom: 4px"
        />
        <input
          class="input-box-pw bodyMedium16px"
          type="password"
          v-model="passwordCheck"
          placeholder="비밀번호를 한 번 더 입력해주세요."
          autocomplete="new-password"
        />
      </InputField>

      <!-- 이름 -->
      <InputField
        label="이름을 입력해주세요."
        placeholder="이름을 입력하세요."
        v-model="username"
      />

      <!-- 연락처 -->
      <InputField label="연락처를 입력해주세요.">
        <input
          class="input-box-pw bodyMedium16px"
          type="tel"
          :value="phone"
          @input="onPhoneInput"
          maxlength="13"
          placeholder="연락처를 입력하세요."
        />
      </InputField>

      <LgSubmitBtn
        class="submit-btn"
        type="submit"
        text="회원가입 완료"
        :disabled="loading"
      />
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios' 
import AuthTitle from '@/pages/auth/components/AuthTitle.vue'
import InputField from '@/components/input/InputField.vue'
import LgSubmitBtn from '@/components/button/LgSubmitBtn.vue'
import InputEmail from '@/pages/auth/components/InputEmail.vue'

const router = useRouter()

const email = ref('')
const password = ref('')
const passwordCheck = ref('')
const username = ref('')
const phone = ref('')

const emailError = ref('')
const passwordError = ref('')
const loading = ref(false)

let signupSuccess = false

// 이메일 중복 확인
async function checkEmailDuplicate() {
  const val = email.value.trim()
  if (!val) {
    emailError.value = '이메일을 입력해주세요.'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(val)) {
    emailError.value = '올바른 이메일 형식이 아닙니다.'
    return
  }
  emailError.value = ''

  // 서버 요청 부분 주석 처리
  /*
  try {
    const res = await axios.get(
      `http://localhost:8080/member/checkusername/${val}`
    )
    if (res.data) {
      emailError.value = '이미 사용 중인 이메일입니다.'
    } else {
      alert('사용 가능한 이메일입니다.')
    }
  } catch {
    emailError.value = '중복 확인 중 오류가 발생했습니다.'
  }
  */

  // 데모 모드
  setTimeout(() => {
    alert('사용 가능한 이메일입니다.')
  }, 500)
}

// 연락처 입력 포맷팅
function onPhoneInput(e) {
  let numbers = e.target.value.replace(/[^0-9]/g, '')
  if (numbers.length > 11) numbers = numbers.slice(0, 11)

  let formatted = ''
  if (numbers.length < 4) {
    formatted = numbers
  } else if (numbers.length < 8) {
    formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  } else {
    formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11
    )}`
  }
  phone.value = formatted
}

// 비밀번호 조합 검사
function isPasswordValid(pw) {
  let types = 0
  if (/[A-Za-z]/.test(pw)) types++
  if (/\d/.test(pw)) types++
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) types++
  return pw.length >= 8 && types >= 2
}

// 비밀번호 실시간 검사
watch([password, passwordCheck], ([pw, pwCheck]) => {
  if (!pw) {
    passwordError.value = ''
    return
  }
  if (!isPasswordValid(pw)) {
    passwordError.value =
      '비밀번호는 영문, 숫자, 특수문자 중 2종류 이상을 조합해 8자 이상이어야 합니다.'
    return
  }
  if (pwCheck && pw !== pwCheck) {
    passwordError.value = '비밀번호가 일치하지 않습니다.'
    return
  }
  passwordError.value = ''
})

// 제출
async function onSubmit() {
  if (loading.value) return
  loading.value = true

  if (!email.value || !password.value || !username.value || !phone.value) {
    alert('모든 정보를 입력해주세요.')
    signupSuccess = false
    loading.value = false
    return
  }
  if (password.value !== passwordCheck.value) {
    passwordError.value = '비밀번호가 일치하지 않습니다.'
    signupSuccess = false
    loading.value = false
    return
  }
  if (!isPasswordValid(password.value)) {
    passwordError.value =
      '비밀번호는 영문, 숫자, 특수문자 중 2종류 이상을 조합해 8자 이상이어야 합니다.'
    signupSuccess = false
    loading.value = false
    return
  }

  // 🔒 서버 요청 부분 주석 처리
  /*
  try {
    const userData = {
      email: email.value,
      password: password.value,
      username: username.value,
      phone: phone.value.replace(/-/g, ''),
      userType: '중개사',
    }
    await axios.post('http://localhost:8080/member', userData)

    alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.')
    signupSuccess = true
    router.push('/auth/login')
  } catch (error) {
    console.error('회원가입 실패:', error)
    alert('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    signupSuccess = false
  } finally {
    loading.value = false
  }
  */

  // 👉 데모 모드
  setTimeout(() => {
    alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.')
    signupSuccess = true
    router.push('/auth/login')
    loading.value = false
  }, 800)
}
</script>

<style scoped>
.root {
  padding-top: 50px;
}

.signup-form {
  margin: 1.5rem 1rem;
  box-sizing: border-box;
  padding: 0 1rem;
}

.input-box-pw {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: 1px solid var(--color-lightgray);
  padding: 0 16px;
  box-sizing: border-box;
  background: var(--color-white);
  transition: border 0.2s;
}

.input-box-pw::placeholder {
  color: var(--color-mediumgray);
}

.submit-btn {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 90px;
}
</style>
