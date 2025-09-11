<template>
  <SimpleHeader :title="title" :show-button="false" :show-more-button="true" />
  <div class="home-page">
    <div class="btn-wrapper">
      <SegmentedButton :active="selected === 1" @click="selected = 1">
        전체
      </SegmentedButton>
      <SegmentedButton :active="selected === 2" @click="selected = 2">
        양도
      </SegmentedButton>
      <SegmentedButton :active="selected === 3" @click="selected = 3">
        승계
      </SegmentedButton>
    </div>

    <section class="chat-room">
      <div
        v-for="value in filteredChats"
        :key="value.id"
        @click="moveToChatRoom(value)"
      >
        <ChatRoom :chatInfo="value" />
      </div>
    </section>
  </div>
</template>

<script setup>
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import SegmentedButton from '../../components/common/SegmentedBtn.vue';
import ChatRoom from './components/ChatRoom.vue';
import { onMounted, ref, computed } from 'vue';
import { getChatDetail, getChatRoom } from '@/api/chat';
import { useRouter } from 'vue-router';

const title = '채팅';
const selected = ref(1);

const chatInfo = ref();

// 선택된 탭에 맞춰 필터링
const filteredChats = computed(() => {
  if (selected.value === 1) return chatInfo.value; // 전체
  if (selected.value === 2)
    return chatInfo.value.filter((c) => c.role === 'SELLER');
  if (selected.value === 3)
    return chatInfo.value.filter((c) => c.role === 'BUYER');
  return chatInfo.value;
});

onMounted(async () => {
  const raw = sessionStorage.getItem('user'); // 문자열
  const user = raw ? JSON.parse(raw) : null; // 객체로 변환
  console.log(user);

  if (!user) {
    router.push('/auth/login');
  }

  const data = await getChatRoom(user.userId); // userId 넘기기
  chatInfo.value = data.chatUnits;
});

const router = useRouter();
const moveToChatRoom = async (chat) => {
  const res = await getChatDetail(chat.roomId);

  router.push({
    path: `/chat-detail/${chat.otherUserName}`,
    query: { roomId: chat.roomId },
    state: { chatDetail: res.chatMessages },
  });
};
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
