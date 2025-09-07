<template>
  <div class="chat-item" @click="goToDetail">
    <div class="chat-avatar"></div>
    <div class="chat-body">
      <span class="chat-userid">{{ props.chatInfo.id }}</span>
      <span class="chat-message">{{ props.chatInfo.message }}</span>
    </div>
    <span class="chat-timestamp">{{ props.chatInfo.time }}</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  chatInfo: Object,
});

const router = useRouter();

const goToDetail = () => {
  router.push({
    name: 'chat-detail',
    params: { id: props.chatInfo.id },
    state: { chatData: props.chatInfo },
  });
};
</script>

<style scoped>
.chat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.chat-avatar {
  background-color: var(--color-lightgray);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chat-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 65%;
}

.chat-userid {
  font-weight: bold;
}

.chat-message {
  color: var(--color-darkgray);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-timestamp {
  margin-left: auto;
  color: var(--color-mediumgray);
  font-size: 0.8rem;
}
</style>
