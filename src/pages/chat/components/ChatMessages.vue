<template>
  <div class="messages" ref="messagesContainer" @scroll="onScroll">
    <template v-for="(msg, index) in messages" :key="index">
      <div v-if="shouldShowDateSeparator(index)" class="date-separator">
        <span>{{ formatDate(msg.date) }}</span>
      </div>

      <div
        :class="[
          'message-row',
          msg.user === 'me' ? 'mine' : 'other',
          getGapClass(index),
        ]"
      >
        <div :class="['message', msg.user === 'me' ? 'mine' : 'other']">
          {{ msg.text }}
        </div>
        <span v-if="shouldShowTimestamp(index)" class="timestamp">
          {{ msg.time }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['scroll-state-change']);
const messagesContainer = ref(null);

// ... getGapClass, formatDate 등 다른 함수들은 그대로 ...

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
  () => props.messages,
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

// ✅ 이 부분을 수정합니다.
onMounted(async () => {
  // 컴포넌트가 그려질 때까지 기다립니다.
  await nextTick();

  // ✅ 스크롤을 즉시 맨 아래로 이동시킵니다.
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }

  // 기존 스크롤 상태 체크 로직은 그대로 둡니다.
  checkScroll();
});

defineExpose({ scrollToBottom, isScrolledToBottom, checkScroll, isAtBottom });

// ... 나머지 헬퍼 함수들은 여기에 그대로 위치 ...
const getGapClass = (index) => {
  if (index === 0) return 'different-user';
  const current = props.messages[index];
  const prev = props.messages[index - 1];
  return current.user === prev.user ? 'same-user' : 'different-user';
};
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
const shouldShowTimestamp = (index) => {
  const currentMsg = props.messages[index];
  const nextMsg = props.messages[index + 1];
  if (!nextMsg) return true;
  return currentMsg.user !== nextMsg.user || currentMsg.time !== nextMsg.time;
};
</script>

<style scoped>
/* 스타일은 기존과 동일합니다. */
.messages {
  display: flex;
  flex-direction: column;
  padding: 1rem;
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
