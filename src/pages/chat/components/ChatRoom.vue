<template>
  <div class="chat-item" @click="goToDetail(partnerId)">
    <div class="chat-avatar"></div>
    <div class="chat-body">
      <span class="chat-userid">{{ partnerId }}</span>
      <span class="chat-message">{{ props.chatInfo.message }}</span>
    </div>
    <span class="chat-timestamp">{{ props.chatInfo.time }}</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const props = defineProps({
  chatInfo: {
    type: Object,
    required: true,
  },
});

const loggedInUserId = 1;

const partnerId = computed(() => {
  if (!props.chatInfo) {
    return null;
  }

  const { buyerId, sellerId } = props.chatInfo;

  return loggedInUserId === buyerId ? sellerId : buyerId;
});

const router = useRouter();

const goToDetail = (userId) => {
  if (!userId) return;
  router.push({
    name: 'chat-detail',
    params: { id: userId },
    state: { chatData: props.chatInfo },
  });
};
</script>

<style scoped>
/* 스타일은 기존과 동일합니다. */
.chat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  cursor: pointer;
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
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-timestamp {
  margin-left: auto;
  color: var(--color-mediumgray);
  font-size: 0.7rem;
}
</style>
