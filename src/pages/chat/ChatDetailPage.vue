<template>
  <div>
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

    <div class="chat-container">
      <MarketInfo />

      <ChatMessages
        :messageHistory="messageHistory"
        :messages="messages"
        ref="chatMessagesRef"
        @scroll-state-change="handleScrollState"
      />

      <ChatInput @send="sendMessage" />

      <FloatingBtn v-if="!isAtBottom" @click="handleScrollToBottom" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import Popover from '@/components/layout/Popover.vue';
import MarketInfo from './components/MarketInfo.vue';
import ChatInput from './components/ChatInput.vue';
import ChatMessages from './components/ChatMessages.vue';
import FloatingBtn from './components/FloatingBtn.vue';
import { getChatDetail } from '@/api/chat';

// stomp & sockjs
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const route = useRoute();
const id = route.params.id;

const messageHistory = ref([]);
const messages = ref([]);

const popoverVisible = ref(false);
const popoverOptions = [
  { label: '신고', value: 1 },
  { label: '차단', value: 2 },
  { label: '나가기', value: 3 },
];

const chatMessagesRef = ref(null);
const isAtBottom = ref(true);

const handleScrollState = (atBottom) => {
  isAtBottom.value = atBottom;
};
const handleScrollToBottom = () => {
  chatMessagesRef.value?.scrollToBottom();
};

const togglePopover = () => {
  popoverVisible.value = !popoverVisible.value;
};
const handleSelect = (item) => {
  popoverVisible.value = false;
  alert(`옵션 ${item.value} 선택!`);
};

let stompClient = null;

onMounted(async () => {
  // 과거 메시지 불러오기
  const res = await getChatDetail(route.query.roomId);
  messageHistory.value = res.chatMessages || [];

  connectWebSocket();
});

// ✅ 웹소켓 연결
const connectWebSocket = () => {
  const socket = new SockJS('http://localhost:8080/ws/chat'); // 서버 endpoint
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    console.log('✅ WebSocket 연결 성공');

    // 채팅방 구독
    stompClient.subscribe(`/topic/chat/${route.query.roomId}`, (msg) => {
      const received = JSON.parse(msg.body);
      console.log('📩 받은 메시지:', received);

      messages.value.push(received);

      nextTick(() => {
        chatMessagesRef.value?.scrollToBottom();
      });
    });
  });
};

// ✅ 메시지 전송
const sendMessage = (text) => {
  if (!text.trim()) return;

  const userItem = sessionStorage.getItem('user');
  const currentUser = userItem ? JSON.parse(userItem) : null;
  const currentUserId = currentUser ? Number(currentUser.userId) : 0;

  const newMsg = {
    roomId: Number(route.query.roomId),
    senderId: currentUserId,
    content: text,
  };

  // 서버로 전송
  if (stompClient && stompClient.connected) {
    stompClient.send('/app/chat/sendMessage', {}, JSON.stringify(newMsg));
  }

  // 로컬에서도 반영 (안 하면 서버 응답 오기 전까지 공백 느낌)
  // messages.value.push({
  //   ...newMsg,
  //   chatMessageId: Date.now(),
  //   sentAt: new Date().toISOString(),
  // });

  nextTick(() => {
    chatMessagesRef.value?.scrollToBottom();
  });
};

// ✅ 연결 해제
onBeforeUnmount(() => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log('❌ WebSocket 연결 해제');
    });
  }
});
</script>

<style scoped>
.chat-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 82vh;
}
</style>
