<template>
  <div class="page">
    <SimpleHeader title="대출·지원금" />

    <TopMessage
      class="px"
      :prefix="'내 정보를 바탕으로 '"
      :highlight="'대출·지원금'"
      :suffix="' 적격 여부를 바로 확인해요'"
    />

    <main class="content px">
      <img :src="docImg" class="doc" alt="doc" />

      <ul class="features">
        <li v-for="(f, i) in features" :key="i" class="feature">
          <span class="icon-box">
            <img v-if="f.icon" :src="f.icon" alt="" />
          </span>
          <span class="bodyMedium18px">{{ f.text }}</span>
        </li>
      </ul>
    </main>

    <BottomCTA class="px" label="다음" :reserve-bottom="8" @click="goNext">
      <template #below>
        <div class="list-link bodyLight12px" @click="goList">
          대출·지원금 목록 보기
        </div>
      </template>
    </BottomCTA>
  </div>
</template>

<script setup>
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import TopMessage from './components/TopMessage.vue';
import BottomCTA from './components/BottomCTA.vue';
import { useRouter } from 'vue-router';

import docImg from '@/assets/icons/financial/document.png';
import checkImg from '@/assets/icons/financial/check.png';
import barchartImg from '@/assets/icons/financial/barchart.png';
import notificationImg from '@/assets/icons/financial/notification.png';

const features = [
  { text: '조건 충족 여부를 직관적으로 보여줘요', icon: checkImg },
  { text: '한도, 금리, 조건을 쉽게 비교해요', icon: barchartImg },
  { text: '필요 서류와 다음 행동을 안내해요', icon: notificationImg },
];

const router = useRouter();
const goNext = () => router.push('/financial/result?status=eligible');
const goList = () => router.push('/financial/list'); // TODO: 실제 라우트로 교체
</script>

<style scoped>
.px {
  padding-left: 2rem;
  padding-right: 2rem;
}

.page {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: var(--color-white);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.doc {
  width: 25rem;
  display: block;
  padding: 0.5rem 4rem 3rem 6rem;
}

.features {
  width: 100%;
  margin: 0 0 0.5rem;
  list-style: none;
}
.feature {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.icon-box {
  width: 1.1rem;
  height: 1.1rem;
  flex: 0 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.icon-box img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.list-link {
  text-align: center;
  margin: 0;
  color: var(--color-darkgray);
  font-size: 0.8rem;
  line-height: 1.4;
  text-decoration: underline;
  cursor: pointer;
}
</style>
