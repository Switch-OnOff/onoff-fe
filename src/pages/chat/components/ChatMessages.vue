<template>
  <div class="messages" ref="messagesContainer" @scroll="onScroll">
    <template
      v-for="(msg, index) in formattedMessages"
      :key="msg.chatMessageId"
    >
      <div v-if="shouldShowDateSeparator(index)" class="date-separator">
        <span>{{ formatDate(msg.date) }}</span>
      </div>

      <div
        :class="[
          'message-row',
          msg.user === 'mine' ? 'mine' : 'other',
          getGapClass(index),
        ]"
      >
        <div :class="['message', msg.user === 'mine' ? 'mine' : 'other']">
          {{ msg.content }}
        </div>
        <span v-if="shouldShowTimestamp(index)" class="timestamp">
          {{ msg.time }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue';

const props = defineProps({
  // API로 불러오는 과거 대화 내역
  messageHistory: {
    type: Array,
    default: () => [],
  },
  // 웹소켓으로 받는 실시간 메시지
  messages: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['scroll-state-change']);
const messagesContainer = ref(null);

// sessionStorage에서 현재 로그인 유저 정보 가져오기
const userItem = sessionStorage.getItem('user');
const currentUser = userItem ? JSON.parse(userItem) : null;
const currentUserId = currentUser ? Number(currentUser.userId) : 0;

// formattedMessages: messageHistory + messages 합치고 'mine'/'other' 계산
const formattedMessages = computed(() => {
  const allMessages = [
    ...(props.messageHistory || []),
    ...(props.messages || []),
  ];

  return allMessages.map((msg) => {
    const sentDate = new Date(msg.sentAt);
    return {
      ...msg,
      user: msg.senderId === currentUserId ? 'mine' : 'other',
      date: sentDate.toISOString().slice(0, 10),
      time: sentDate.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  });
});

// 헬퍼 함수
const getGapClass = (index) => {
  if (index === 0) return 'different-user';
  const current = formattedMessages.value[index];
  const prev = formattedMessages.value[index - 1];
  return current.user === prev.user ? 'same-user' : 'different-user';
};

const shouldShowDateSeparator = (index) => {
  if (index === 0) return true;
  const currentMsg = formattedMessages.value[index];
  const prevMsg = formattedMessages.value[index - 1];
  return currentMsg.date !== prevMsg.date;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const shouldShowTimestamp = (index) => {
  const currentMsg = formattedMessages.value[index];
  const nextMsg = formattedMessages.value[index + 1];
  if (!nextMsg) return true;
  return currentMsg.user !== nextMsg.user || currentMsg.time !== nextMsg.time;
};

// 스크롤 로직
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    });
  }
};

const isScrolledToBottom = () => {
  if (!messagesContainer.value) return true;
  const { scrollTop, clientHeight, scrollHeight } = messagesContainer.value;
  const threshold = 50;
  return scrollHeight - scrollTop - clientHeight < threshold;
};

const isAtBottom = ref(true);
const checkScroll = () => {
  isAtBottom.value = isScrolledToBottom();
  emit('scroll-state-change', isAtBottom.value);
};

const onScroll = () => {
  checkScroll();
};

watch(
  () => formattedMessages.value,
  (newVal, oldVal) => {
    if (newVal.length > (oldVal?.length ?? 0)) {
      const userWasAtBottom = isScrolledToBottom();
      nextTick(() => {
        if (userWasAtBottom) {
          messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight;
        }
      });
    }
    nextTick(checkScroll);
  },
  { deep: true }
);

onMounted(() => {
  checkScroll();
});

defineExpose({ scrollToBottom, isScrolledToBottom, checkScroll, isAtBottom });
</script>

<style scoped>
.messages {
  display: flex;
  flex-direction: column;
  padding: 5rem 1rem 1rem;
  flex-grow: 1;
  overflow-y: auto;
}
.message-row {
  display: flex;
  align-items: flex-end;
  gap: 0.3rem;
  font-size: 0.8rem;
}
.message-row.same-user {
  margin-top: 8px;
}
.message-row.different-user {
  margin-top: 20px;
}
.message-row.mine {
  justify-content: flex-end;
}
.message-row.mine .timestamp {
  order: -1;
  margin-right: 0.3rem;
  letter-spacing: -0.03em;
}
.message-row.other {
  justify-content: flex-start;
}
.message-row.other .timestamp {
  order: 1;
  margin-left: 0.3rem;
}
.message {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  max-width: 70%;
  word-break: break-word;
}
.message.mine {
  color: #fff;
  background-color: var(--color-primary);
}
.message.other {
  background-color: #f2f3f7;
}
.timestamp {
  font-size: 0.65rem;
  color: #999;
}
.date-separator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 3rem 0 0.7rem 0;
  color: var(--color-darkgray);
  font-size: 0.75rem;
}
.date-separator:first-of-type {
  margin-top: 0.5rem;
}
.date-separator span {
  background-color: #e9e9e9;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}
</style>
