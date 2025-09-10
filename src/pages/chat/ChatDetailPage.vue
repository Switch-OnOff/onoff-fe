<template>
  <div class="chat-container">
    <SimpleHeader
      :title="id"
      :show-more-button="true"
      @more-click="togglePopover"
    />

    <Popover
      :visible="popoverVisible"
      :options="popoverOptions"
      @select="handleSelect"
      @close="popoverVisible = false"
    />

    <MarketInfo />

    <ChatMessages :messages="messages" ref="chatMessagesRef" />
    <ChatInput @send="sendMessage" />
  </div>
</template>

<script setup>
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import Popover from '@/components/layout/Popover.vue';
import MarketInfo from './components/MarketInfo.vue';
import ChatInput from './components/ChatInput.vue';
import ChatMessages from './components/ChatMessages.vue';
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const id = route.params.id;

// Popover
const popoverVisible = ref(false);
const popoverOptions = [
  { label: '신고', value: 1 },
  { label: '차단', value: 2 },
  { label: '나가기', value: 3 },
];

const togglePopover = () => {
  popoverVisible.value = !popoverVisible.value;
};

const handleSelect = (item) => {
  popoverVisible.value = false;
  alert(`옵션 ${item.value} 선택!`);
};

// 메시지 배열
const messages = ref([]);
const chatMessagesRef = ref(null);

// ✅ 날짜 생성 헬퍼 함수
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 웹소켓 연결
let ws;
onMounted(() => {
  ws = new WebSocket('ws://localhost:8080/ws/chat');

  ws.onopen = () => console.log('WebSocket 연결됨');

  ws.onmessage = (event) => {
    const shouldScroll = chatMessagesRef.value?.isScrolledToBottom() ?? true;

    const data = JSON.parse(event.data); // 서버에서 시간을 주지 않을 경우를 대비해 여기서도 생성

    if (!data.time) {
      const now = new Date();
      data.time = now.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    }

    // ✅ 받은 메시지에 날짜 추가
    messages.value.push({
      text: data.text,
      user: data.user,
      time: data.time,
      date: getCurrentDate(), // ✅ 오늘 날짜 추가
    });

    nextTick(() => {
      if (shouldScroll) {
        chatMessagesRef.value?.scrollToBottom();
      }
    });
  };

  ws.onclose = () => console.log('WebSocket 연결 종료');
});

onBeforeUnmount(() => {
  if (ws) ws.close();
});

// ChatInput에서 전송된 메시지 처리
const sendMessage = (msg) => {
  const shouldScroll = chatMessagesRef.value?.isScrolledToBottom() ?? true;

  const now = new Date();
  const date = getCurrentDate(); // ✅ 날짜 생성
  const time = now.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  // ✅ newMessage 객체에 date 속성 포함
  const newMessage = {
    text: msg,
    user: 'me',
    time: time,
    date: date, // ✅ 생성한 date 값을 객체에 추가
  };

  messages.value.push(newMessage);
  if (ws && ws.readyState === WebSocket.OPEN) {
    // 웹소켓으로 보낼 때도 date를 포함해서 보낼 수 있습니다 (서버 로직에 따라 선택)
    ws.send(JSON.stringify(newMessage));
  }

  nextTick(() => {
    if (shouldScroll) {
      chatMessagesRef.value?.scrollToBottom();
    }
  });
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 82vh;
}

.home-page {
  padding: 16px;
}
</style>
