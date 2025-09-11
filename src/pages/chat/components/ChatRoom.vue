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
    // ✅ chatInfo 객체에 buyerId와 sellerId가 포함되어야 합니다.
    // 예시: { buyerId: 1, sellerId: 2, message: '...', time: '...' }
    required: true,
  },
});

// 1. 현재 로그인한 사용자의 아이디를 정의합니다.
const loggedInUserId = 1;

// ✅ 2. 핵심 로직: buyerId와 sellerId를 기반으로 상대방 아이디를 계산합니다.
const partnerId = computed(() => {
  if (!props.chatInfo) {
    return null;
  }

  const { buyerId, sellerId } = props.chatInfo;

  // 만약 로그인한 유저가 buyer이면, 상대방은 seller입니다.
  // 그렇지 않다면, 상대방은 buyer입니다.
  return loggedInUserId === buyerId ? sellerId : buyerId;
});

const router = useRouter();

// 3. 클릭 시 동적으로 계산된 partnerId를 사용합니다. (이 부분은 수정 없음)
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
