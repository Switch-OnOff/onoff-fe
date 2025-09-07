<template>
  <div class="chat-item">
    <div class="chat-avatar"></div>
    <div class="chat-body">
      <span class="chat-username">{{ props.chatInfo.name }}</span>
      <span class="chat-message">{{ props.chatInfo.chat }}</span>
    </div>
    <span class="chat-timestamp">{{ props.chatInfo.time }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  chatInfo: 'chatInfo',
});
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

.chat-username {
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
