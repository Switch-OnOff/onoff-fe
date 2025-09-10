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

const title = '채팅';
const selected = ref(1);

const chatInfo = ref([
  {
    id: 'leeday11',
    message: '오늘 몇 시에 뵐까요??',
    time: '오후 7:30',
    type: '양도',
  },
  {
    id: 'leeday12',
    message: '좋은 거래 감사합니다!! 늘 행복한 일만 가득하세요!',
    time: '어제',
    type: '양도',
  },
  {
    id: 'leeday13',
    message: '오늘까지는 영업중이라서, 내일부터 보실 수 있습니다',
    time: '9월 4일',
    type: '양도',
  },
  {
    id: 'leeday14',
    message: '오늘 몇 시에 뵐까요??',
    time: '9월 1일',
    type: '양도',
  },
  {
    id: 'leeday15',
    message: '오늘 몇 시에 뵐까요??',
    time: '9월 1일',
    type: '승계',
  },
]);

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
  // API에서 가져오는 경우
  // const userID = 'user';
  // chatInfo.value = await getChatInfo(userID);
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
