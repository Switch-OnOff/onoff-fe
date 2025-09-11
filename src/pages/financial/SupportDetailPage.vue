<template>
  <SimpleHeader />
  <div class="container">
    <div class="segment-wrapper">
      <SegmentedBtn class="tag-segment">지원금</SegmentedBtn>
      <SegmentedBtn class="tag-segment">현금</SegmentedBtn>
    </div>
    <div class="title">
      <div class="img-box"><img :src="GovIcon" /></div>
      <div class="titleExtra20px">
        {{ detail?.serviceName || '지원금 상세' }}
      </div>
    </div>
    <div class="content-box">
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">지원 내용</div>
        <div class="bodyRegular16px">
          {{ detail?.serviceContents || '상세 내용을 준비 중입니다.' }}
        </div>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">지원 대상</div>
        <div class="bodyRegular16px">
          {{ detail?.serviceStatus || '대상 정보가 없습니다.' }}
        </div>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">대상 업종</div>
        <div class="bodyRegular16px">
          {{ detail?.industry || '업종 미지정' }}
        </div>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">대상 지역</div>
        <div class="bodyRegular16px">{{ detail?.location || '전국' }}</div>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">선정 기준</div>
        <ul class="bullet bodyRegular16px">
          <li v-for="(it, i) in criteriaList" :key="i">{{ it }}</li>
        </ul>
      </div>
      <div class="label-wrapper">
        <div class="content-title bodyBold16px">제출 서류</div>
        <ul class="bullet bodyRegular16px">
          <li v-for="(it, i) in docsList" :key="i">{{ it }}</li>
        </ul>
      </div>
    </div>
    <BottomCTA :label="'상품 페이지로 이동'" @click="openLink" />
  </div>
</template>

<script setup>
import SegmentedBtn from '@/components/common/SegmentedBtn.vue';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import GovIcon from '@/assets/icons/financial/logo_gov.png';
import BottomCTA from './components/BottomCTA.vue';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as grants from '@/api/grants';

const route = useRoute();
const router = useRouter();

// 상세 데이터
const detail = ref(null);
const criteriaList = computed(() =>
  String(detail.value?.selectionCriteria || '')
    .split(/\r?\n|\n/g)
    .map((s) => s.trim())
    .filter(Boolean)
);
const docsList = computed(() =>
  String(detail.value?.requiredDocuments || '')
    .split(/\r?\n|\n/g)
    .map((s) => s.trim())
    .filter(Boolean)
);

// id는 라우터 설정에 따라 params 또는 query로 올 수 있음
const serviceId = computed(() => {
  // 우선 params 지원: /financial/support/:serviceId
  const p = Number(route.params.serviceId);
  if (!Number.isNaN(p) && p > 0) return p;
  // 그게 아니면 query로: /financial/support-detail?id=123
  const q = Number(route.query.id);
  if (!Number.isNaN(q) && q > 0) return q;
  return 0;
});

// 키워드만 있고 id가 없을 때, 검색으로 보정
async function resolveIdFromKeyword(keyword) {
  const arr = (await grants.searchGrants(keyword)) || [];
  const hit = arr.find((x) => x.serviceName?.includes(keyword)) || arr[0];
  return hit?.serviceId || 0;
}

onMounted(async () => {
  try {
    let id = serviceId.value;
    if (!id) {
      const kw = sessionStorage.getItem('financial-keyword') || '';
      if (kw) id = await resolveIdFromKeyword(kw);
    }
    if (!id) return;
    detail.value = await grants.getGrantDetail(id);
  } catch (e) {
    console.error('지원금 상세 로드 실패', e);
  }
});

function gotoCriteria() {
  if (!detail.value?.serviceId) return;
  router.push({
    path: '/financial/support-criteria',
    query: { id: detail.value.serviceId },
  });
}
function gotoDocs() {
  if (!detail.value?.serviceId) return;
  router.push({
    path: '/financial/support-docs',
    query: { id: detail.value.serviceId },
  });
}

function openLink() {
  const url = detail.value?.serviceLink;
  if (url) window.open(url, '_blank');
}
</script>

<style scoped>
.container {
  padding: 2rem;
}
.segment-wrapper {
  display: flex;
  gap: 8px;
}
.tag-segment {
  padding: 0.2px 10px;
  background-color: var(--color-lightgray);
}

.title {
  margin-top: 1.3rem;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 15px;
}

.img-box {
  width: 40px;
  height: 40px;
  background-color: var(--color-lightgray);
  border-radius: 5rem;
}

.img-box > img {
  width: 100%;
  height: 100%;
}

.content-box {
  border: 1.5px solid var(--color-lightgray);
  border-radius: 14px;
  padding: 1rem 0.75rem;
  margin-top: 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.content-title {
  color: var(--color-darkgray);
  min-width: 80px;
  flex: 0 0 80px;
}
.bodyRegular16px {
  color: var(--color-black);
  /* 긴 URL/영문/연속문자열 줄바꿈 처리 */
  overflow-wrap: anywhere;
  word-break: break-word;
  /* 개행문자 유지 (API에 줄바꿈 포함된 경우 가독성 향상) */
  white-space: pre-line;
}
.titleExtra20px {
  margin-top: 2px;
}
.bullet {
  margin: 0.1rem 0 0 0;
  padding-left: 1.25rem;
  counter-reset: num;
}
.bullet li {
  position: relative;
  margin: 0.25rem 0;
}
.bullet li::before {
  counter-increment: num;
  content: counter(num) '.';
  position: absolute;
  left: -1.25rem;
  color: var(--color-darkgray);
}
.bullet {
  margin: 0.25rem 0 0 0;
  padding-left: 1rem;
}
</style>
