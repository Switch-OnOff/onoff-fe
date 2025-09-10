<template>
  <SimpleHeader :title="title" :show-button="false" :show-more-button="true" />
  <div class="home-page">
    <div class="btn-wrapper">
      <SegmentedButton :active="selected === 1" @click="selected = 1"
        >전체</SegmentedButton
      >
      <SegmentedButton :active="selected === 2" @click="selected = 2"
        >양도</SegmentedButton
      >
      <SegmentedButton :active="selected === 3" @click="selected = 3"
        >승계</SegmentedButton
      >
    </div>
    <section class="chat-room">
      <div v-for="value in chatInfo">
        <ChatRoom :chatInfo="value" />
      </div>
    </section>
  </div>
</template>

<script setup>
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import SegmentedButton from './components/SegmentedBtn.vue';
import ChatRoom from './components/ChatRoom.vue';
import { ref } from 'vue';

const title = '채팅';
const selected = ref(1);

const chatInfo = [
  {
    id: 'leeday11',
    message: '오늘 몇 시에 뵐까요??',
    time: '오후 7:30',
  },
  {
    id: 'leeday12',
    message: '좋은 거래 감사합니다!! 늘 행복한 일만 가득하세요!',
    time: '어제',
  },
  {
    id: 'leeday13',
    message: '오늘까지는 영업중이라서, 내일부터 보실 수 있습니다',
    time: '9월 4일',
  },
  {
    id: 'leeday14',
    message: '오늘 몇 시에 뵐까요??',
    time: '9월 1일',
  },
  {
    id: 'leeday15',
    message: '오늘 몇 시에 뵐까요??',
    time: '9월 1일',
  },
];
</script>

<style scoped>
.home-page {
  padding: 16px;
}

.btn-wrapper {
  display: flex;
  gap: 0.5rem;
}

.chat-room {
  margin-top: 30px;
}
</style>
