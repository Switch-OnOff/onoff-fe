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
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
    // 각 메시지 객체에 date 속성(예: '2023-10-27')이 포함되어야 합니다.
  },
});

const messagesContainer = ref(null);

// 날짜 구분선을 표시할지 결정하는 함수
const shouldShowDateSeparator = (index) => {
  if (index === 0) {
    return true; // 가장 첫 메시지 위에 항상 날짜 표시
  }

  const currentMsg = props.messages[index];
  const prevMsg = props.messages[index - 1];

  return currentMsg.date !== prevMsg.date;
};

const formatDate = (dateString) => {
  if (!dateString) return ''; // dateString이 없는 경우 빈 문자열 반환

  const date = new Date(dateString);

  // date 객체가 유효하지 않은 날짜인지 확인
  if (isNaN(date.getTime())) {
    // 개발 중에 문제를 쉽게 찾을 수 있도록 콘솔에 에러를 출력합니다.
    console.error('Invalid date string received:', dateString);
    return ''; // 빈 문자열을 반환하여 UI에 NaN이 표시되지 않도록 합니다.
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
};

// 시간을 표시할지 결정하는 로직 함수 (기존과 동일)
const shouldShowTimestamp = (index) => {
  const currentMsg = props.messages[index];
  const nextMsg = props.messages[index + 1];

  if (!nextMsg) {
    return true;
  }

  if (currentMsg.user !== nextMsg.user || currentMsg.time !== nextMsg.time) {
    return true;
  }

  return false;
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const isScrolledToBottom = () => {
  if (!messagesContainer.value) return true;
  const { scrollTop, clientHeight, scrollHeight } = messagesContainer.value;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
  return distanceFromBottom < 10;
};

defineExpose({ scrollToBottom, isScrolledToBottom });
</script>

<style scoped>
/* 기존 스타일은 여기에 그대로 유지 */
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
