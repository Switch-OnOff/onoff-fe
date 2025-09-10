<template>
  <div class="messages" ref="messagesContainer">
    <template v-for="(msg, index) in messages" :key="index">
      <div v-if="shouldShowDateSeparator(index)" class="date-separator">
        <span>{{ formatDate(msg.date) }}</span>
      </div>

      <div :class="['message-row', msg.user === 'me' ? 'mine' : 'other']">
        <span v-if="shouldShowTimestamp(index)" class="timestamp">
          {{ msg.time }}
        </span>
        <div :class="['message', msg.user === 'me' ? 'mine' : 'other']">
          {{ msg.text }}
        </div>
      </div>
    </template>
    <FloatingBtn />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import FloatingBtn from './FloatingBtn.vue';

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
});

const messagesContainer = ref(null);

// 날짜 구분선 표시
const shouldShowDateSeparator = (index) => {
  if (index === 0) return true;
  const currentMsg = props.messages[index];
  const prevMsg = props.messages[index - 1];
  return currentMsg.date !== prevMsg.date;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 타임스탬프 표시
const shouldShowTimestamp = (index) => {
  const currentMsg = props.messages[index];
  const nextMsg = props.messages[index + 1];
  if (!nextMsg) return true;
  return currentMsg.user !== nextMsg.user || currentMsg.time !== nextMsg.time;
};

// 스크롤
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
  const threshold = 50; // 하단에서 50px 이내면 "최하단"으로 취급
  return scrollHeight - scrollTop - clientHeight < threshold;
};

// 최하단이 아닐 때 플로팅 버튼 노출
const isAtBottom = ref(true);
const checkScroll = () => {
  isAtBottom.value = isScrolledToBottom();
};

// 메시지 변경 시 체크
watch(
  () => props.messages,
  () => {
    nextTick(checkScroll);
  },
  { deep: true }
);

// expose
defineExpose({ scrollToBottom, isScrolledToBottom, checkScroll, isAtBottom });
</script>

<style scoped>
.messages {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1rem;
  flex-grow: 1;
  overflow-y: auto;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.message-row.mine {
  justify-content: flex-end;
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

/* 추가된 날짜 구분선 스타일 */
.date-separator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
  color: #999;
  font-size: 0.75rem;
}

.date-separator span {
  background-color: #e9e9e9;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}
</style>
