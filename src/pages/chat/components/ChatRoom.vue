<template>
  <div class="chat-item" @click="goToDetail()">
    <div class="chat-avatar"></div>
    <div class="chat-body">
      <span class="chat-userid">{{ props.chatInfo.otherUserName }}</span>
      <span class="chat-message">{{ props.chatInfo.lastMessage }}</span>
    </div>
    <span class="chat-timestamp">{{ formattedTime }}</span>
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

const router = useRouter();

const goToDetail = (userId) => {
  if (!userId) return;
  router.push({
    name: 'chat-detail',
    params: { id: userId },
    state: { chatData: props.chatInfo },
  });
};

// 날짜 포맷팅 함수
const formattedTime = computed(() => {
  if (!props.chatInfo?.lastMessageTime) return '';

  const date = new Date(props.chatInfo.lastMessageTime);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    const diffHours = Math.floor(diffMinutes / 60);

    return `${diffHours}시간 전`;
  } else {
    // MM월 dd일 형식
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${month}월 ${day}일`;
  }
});
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
