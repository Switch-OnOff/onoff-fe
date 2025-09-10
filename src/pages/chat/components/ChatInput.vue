<template>
  <div class="chat-input-area">
    <ExtraOptionsBox :visible="isBoxVisible" />

    <div class="input-wrapper">
      <div class="btn" @click="toggleIcon">
        <img :class="{ rotated: !isPlus }" src="@/assets/icons/chat/plus.png" />
      </div>
      <input
        v-model="textInput"
        @keyup.enter="sendMessage"
        class="text-input"
        placeholder="메시지를 입력하세요"
      />
      <div class="btn" @click="sendMessage">
        <img src="@/assets/icons/chat/send.png" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// ✅ 새로 만든 컴포넌트를 import 합니다.
import ExtraOptionsBox from './ExtraOptionsBox.vue';

const textInput = ref('');
const emit = defineEmits(['send']);

const isPlus = ref(true);
const isBoxVisible = ref(false);

const toggleIcon = () => {
  isPlus.value = !isPlus.value;
  isBoxVisible.value = !isBoxVisible.value;
};

const sendMessage = () => {
  if (!textInput.value.trim()) return;
  emit('send', textInput.value);
  textInput.value = '';
};
</script>

<style scoped>
.chat-input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 393px;
  margin: 0 auto;
  display: flex;
  flex-direction: column-reverse;
}

.input-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 0.7rem;
  padding: 0.5rem 0.8rem;
  z-index: 10;
  border-top: 1px solid var(--color-lightgray);
  background-color: var(--color-white);
  width: 100%;
  box-sizing: border-box;
}

.btn {
  width: 20px;
  cursor: pointer;
}

.btn > img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.rotated {
  transform: rotate(45deg);
}

.text-input {
  height: 30px;
  background-color: #f2f3f7;
  border: none;
  border-radius: 50px;
  padding: 1.5rem 1rem;
  width: 80%;
}

/* ❌ .extra-box와 .slide-fade 관련 스타일은 자식 컴포넌트로 이동했으므로 삭제합니다. */
</style>
