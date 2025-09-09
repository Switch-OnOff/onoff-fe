<template>
  <div class="input-wrapper">
    <div class="btn"><img src="@/assets/icons/chat/plus.png" /></div>
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
</template>

<script setup>
import { ref } from 'vue';

const textInput = ref('');
const emit = defineEmits(['send']);

const sendMessage = () => {
  if (!textInput.value.trim()) return;
  emit('send', textInput.value);
  textInput.value = '';
};
</script>

<style scoped>
.input-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 0.7rem;
  padding: 0.5rem 0.8rem;
  border-top: 1px solid var(--color-lightgray);
  background-color: var(--color-white);

  width: 100%;
  box-sizing: border-box;

  position: fixed;
  bottom: 0;
  max-width: 393px;
}

.btn {
  width: 20px;
}

.btn > img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.text-input {
  height: 30px;
  background-color: #f2f3f7;
  border: none;
  border-radius: 50px;
  padding: 1.5rem 1rem;
  width: 80%;
}
</style>
