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
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import Popover from '@/components/layout/Popover.vue';
import MarketInfo from './components/MarketInfo.vue';
import ChatInput from './components/ChatInput.vue';
import ChatMessages from './components/ChatMessages.vue';
import FloatingBtn from './components/FloatingBtn.vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useWebSocket } from '@/pages/chat/utils/useWebSocket';

const route = useRoute();
const id = route.params.id;

// Popover 상태
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

// ✅ useWebSocket 훅 사용
const { messages, sendMessage } = useWebSocket('http://localhost:8080/ws/chat');

const chatMessagesRef = ref(null);

// 플로팅 버튼 표시 상태
const isAtBottom = ref(true);
const handleScrollState = (atBottom) => {
  isAtBottom.value = atBottom;
};
const handleScrollToBottom = () => {
  chatMessagesRef.value?.scrollToBottom();
};
</script>

<style scoped>
.chat-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 82vh;
}
</style>
