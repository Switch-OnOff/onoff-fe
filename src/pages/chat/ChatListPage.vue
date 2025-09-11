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
      <div v-for="value in filteredChats" :key="value.id">
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
import { getChatRoom } from '@/api/chat';

const title = '채팅';
const selected = ref(1);

const chatInfo = ref();

// 선택된 탭에 맞춰 필터링
const filteredChats = computed(() => {
  if (selected.value === 1) return chatInfo.value; // 전체
  if (selected.value === 2)
    return chatInfo.value.filter((c) => c.type === '양도');
  if (selected.value === 3)
    return chatInfo.value.filter((c) => c.type === '승계');
  return chatInfo.value;
});

onMounted(async () => {
  const data = await getChatRoom(1);
  chatInfo.value = data;
  console.log(chatInfo.value);
});
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
