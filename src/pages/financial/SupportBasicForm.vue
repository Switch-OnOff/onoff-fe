<!-- src/pages/financial/SupportBasicPage.vue -->
<template>
  <div class="page">
    <SimpleHeader title="지원금" />

    <TopMessage
      class="px"
      :prefix="'지원 대상 확인을 위해'"
      :highlight="'기본 정보'"
      :suffix="'를 입력해주세요'"
    />

    <main class="content px">
      <!-- 현재 상황 -->
      <SelectField
        v-model="store.support.basic.status"
        :items="statusOptions"
        placeholder="현재 상황"
      />

      <!-- 사업장 위치 -->
      <SelectField
        v-model="store.support.basic.location"
        :items="locationOptions"
        placeholder="사업장 위치"
      />

      <!-- 업종 -->
      <SelectField
        v-model="store.support.basic.industry"
        :items="industryOptions"
        placeholder="업종"
      />
    </main>

    <div class="cta-wrap px">
      <BottomCTA :label="'다음'" :reserveBottom="8" @click="goNext">
        <template #below><div class="cta-spacer" /></template>
      </BottomCTA>
    </div>
  </div>
</template>

<script setup>
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import TopMessage from './components/TopMessage.vue';
import BottomCTA from './components/BottomCTA.vue';
import SelectField from '../../components/common/SelectField.vue';
import { onBeforeRouteLeave, useRouter, useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useFinancialStore } from '@/stores/financial';
import * as grants from '@/api/grants';

const router = useRouter();
const route = useRoute();
const store = useFinancialStore();

// API_BASE(mock) 제거, 실제 API 사용

function resetBasic() {
  store.support.basic = { status: '', location: '', industry: '' };
}

onMounted(() => {
  resetBasic();
});

onBeforeRouteLeave((to) => {
  if (to.path !== '/financial/support-criteria') {
    resetBasic();
  }
});

/* 옵션 */
const statusOptions = [
  { label: '예비창업자', value: '예비창업자' },
  { label: '영업중', value: '영업중' },
  { label: '생계곤란/폐업예정', value: '생계곤란/폐업예정' },
];

const locationOptions = [
  { label: '서울', value: '서울' },
  { label: '부산', value: '부산' },
  { label: '대구', value: '대구' },
  { label: '인천', value: '인천' },
  { label: '광주', value: '광주' },
  { label: '대전', value: '대전' },
  { label: '울산', value: '울산' },
  { label: '세종', value: '세종' },
  { label: '경기', value: '경기' },
  { label: '충북', value: '충북' },
  { label: '충남', value: '충남' },
  { label: '전북', value: '전북' },
  { label: '전남', value: '전남' },
  { label: '경북', value: '경북' },
  { label: '경남', value: '경남' },
  { label: '제주', value: '제주' },
  { label: '강원', value: '강원' },
];

const industryOptions = [
  { label: '제조업', value: '제조업' },
  { label: '음식점업', value: '음식점업' },
  { label: '기타', value: '기타' },
];

const canNext = computed(
  () =>
    !!store.support.basic.status &&
    !!store.support.basic.location &&
    !!store.support.basic.industry
);

function splitCSV(str = '') {
  return String(str)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function basicMatchesService(service, basic) {
  const statusOK =
    !service.service_status || service.service_status === basic.status;

  const locOK =
    !service.location ||
    service.location === '전국' ||
    service.location === basic.location;

  const serviceIndustries = splitCSV(service.industry);
  const indOK =
    serviceIndustries.length === 0 ||
    serviceIndustries.includes(basic.industry);

  return statusOK && locOK && indOK;
}

async function fetchServiceByIdOrKeyword() {
  const id = Number(route.query.id || store.support?.currentServiceId || 0);
  try {
    if (id) {
      return await grants.getGrantDetail(id);
    }
    const kw = (sessionStorage.getItem('financial-keyword') || '').trim();
    if (kw) {
      const list = (await grants.searchGrants(kw)) || [];
      return list?.[0] || null;
    }
    const top = (await grants.getTop5Grants()) || [];
    return top?.[0] || null;
  } catch {
    return null;
  }
}

async function goNext() {
  if (!canNext.value) return;

  const service = await fetchServiceByIdOrKeyword();
  const basic = store.support.basic;

  if (service?.serviceId) {
    store.support = { ...store.support, currentServiceId: service.serviceId };
  }

  if (!service || !basicMatchesService(service, basic)) {
    router.push({
      path: '/financial/result',
      query: {
        status: 'ineligible',
        product: service?.service_name || '지원금',
      },
    });
    return;
  }

  router.push({
    path: '/financial/support-criteria',
    query: service?.serviceId ? { id: service.serviceId } : undefined,
  });
}
</script>

<style scoped>
.field {
  height: 2.5rem;
}

.px {
  padding-left: 2rem;
  padding-right: 2rem;
}

.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.cta-wrap {
  margin-top: auto;
}
.cta-spacer {
  height: 1.185rem;
}
</style>
