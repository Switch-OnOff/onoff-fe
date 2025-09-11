<template>
  <SimpleHeader />
  <div class="container" v-if="detail">
    <div class="segment-wrapper">
      <SegmentedBtn class="tag-segment">지원금</SegmentedBtn>
      <SegmentedBtn class="tag-segment">{{
        detail.serviceType || '일반'
      }}</SegmentedBtn>
    </div>

    <div class="title">
      <div class="img-box"><img :src="GovIcon" alt="icon" /></div>
      <div class="titleExtra20px">{{ detail.serviceName }}</div>
    </div>

    <div class="content-box">
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">지원 대상</div>
        <div class="bodyRegular16px">
          {{ detail.industry }} · {{ detail.location }} ·
          {{ detail.serviceStatus }}
        </div>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">지원 내용</div>
        <div class="bodyRegular16px pre">{{ detail.serviceContents }}</div>
      </div>
      <div class="label-wrapper" v-if="detail.serviceLink">
        <div class="content-title bodyBold16px">바로가기</div>
        <a
          class="bodyRegular16px link"
          :href="detail.serviceLink"
          target="_blank"
          rel="noopener"
          >공식 안내</a
        >
      </div>
    </div>

    <div class="btns">
      <button class="btn" @click="gotoCriteria">선정 기준 체크</button>
      <button class="btn" @click="gotoDocs">구비 서류 체크</button>
    </div>
  </div>
  <div v-else class="px">불러오는 중…</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as grants from '@/api/grants';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import SegmentedBtn from '@/components/common/SegmentedBtn.vue';
import GovIcon from '@/assets/icons/gov.png';

const route = useRoute();
const router = useRouter();
const detail = ref(null);

async function resolveServiceIdFromKeyword(keyword) {
  const arr = (await grants.searchGrants(keyword)) || [];
  const hit = arr.find((x) => x.serviceName?.includes(keyword)) || arr[0];
  return hit?.serviceId;
}

onMounted(async () => {
  try {
    let id = Number(route.query.id || 0);
    if (!id) {
      const kw = sessionStorage.getItem('financial-keyword') || '';
      if (kw) id = await resolveServiceIdFromKeyword(kw);
    }
    if (!id) return;
    detail.value = await grants.getGrantDetail(id);
  } catch (e) {
    console.error('지원금 상세 로드 실패', e);
  }
});

function gotoCriteria() {
  router.push({
    path: '/financial/support-criteria',
    query: { id: detail.value?.serviceId },
  });
}
function gotoDocs() {
  router.push({
    path: '/financial/support-docs',
    query: { id: detail.value?.serviceId },
  });
}
</script>

<style scoped>
.container {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.segment-wrapper {
  display: flex;
  gap: 6px;
}
.tag-segment {
  background: #f5f5ff;
}
.title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.img-box {
  width: 24px;
  height: 24px;
}
.content-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.label-wrapper {
  display: flex;
  gap: 8px;
}
.content-title {
  color: var(--color-darkgray);
  min-width: 60px;
}
.pre {
  white-space: pre-wrap;
}
.btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}
.btn {
  height: 44px;
  border-radius: 10px;
  background: var(--color-primary);
  color: #fff;
}
.link {
  color: var(--color-primary);
}
.px {
  padding: 0 16px;
}
</style>
