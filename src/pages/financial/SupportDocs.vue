<!-- src/pages/financial/SupportDocsPage.vue -->
<template>
  <div class="page">
    <SimpleHeader title="대출·지원금" />

    <TopMessage
      class="px"
      :prefix="'지원금 신청 시 필요한'"
      :highlight="'서류'"
      :suffix="' 준비 여부를 체크해주세요'"
    />

    <main class="content px">
      <div v-if="loading" class="placeholder-box bodyLight12px">
        불러오는 중…
      </div>

      <div v-else-if="!docItems.length" class="placeholder-box bodyLight12px">
        공개된 필요 서류가 없어요. (다음으로 진행 가능)
      </div>

      <!-- 동적 체크리스트 -->
      <ul v-else class="checklist">
        <li v-for="(item, i) in docItems" :key="i" class="row">
          <label class="check">
            <input
              class="native"
              type="checkbox"
              :value="item"
              v-model="selected"
            />
            <span class="label bodyMedium16px">{{ item }}</span>
            <span class="icon" aria-hidden="true"></span>
          </label>
        </li>
      </ul>
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
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { useFinancialStore } from '@/stores/financial';

const router = useRouter();
const route = useRoute();
const store = useFinancialStore();

const API_BASE = 'http://localhost:3000';

const loading = ref(false);
const service = ref(null);
const docItems = ref([]); // string[]
const selected = ref([]); // 체크된 서류들

const currentId = computed(() => {
  const q = Number(route.query.id || 0);
  return q || Number(store.support?.currentServiceId || 0) || 0;
});

async function fetchSupportByServiceId(serviceId) {
  const res = await fetch(
    `${API_BASE}/support?service_id=${serviceId}&_limit=1`
  );
  if (!res.ok) throw new Error('support fetch failed');
  const arr = await res.json();
  return arr?.[0] || null;
}

function parseLines(str = '') {
  return String(str)
    .split(/\r?\n|·|\u2022/g)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

async function loadService() {
  loading.value = true;
  try {
    let svc = null;

    if (currentId.value) {
      const r = await fetch(
        `${API_BASE}/support?service_id=${currentId.value}&_limit=1`
      );
      if (r.ok) {
        const arr = await r.json();
        svc = arr?.[0] || null;
      }
    }
    if (!svc) {
      const kw = (sessionStorage.getItem('financial-keyword') || '').trim();
      if (kw) {
        // 정확 매칭
        let r = await fetch(
          `${API_BASE}/support?service_name=${encodeURIComponent(kw)}&_limit=1`
        );
        if (r.ok) {
          const arr = await r.json();
          svc = arr?.[0] || null;
        }
        // like 매칭
        if (!svc) {
          r = await fetch(
            `${API_BASE}/support?service_name_like=${encodeURIComponent(
              kw
            )}&_limit=1`
          );
          if (r.ok) {
            const arr = await r.json();
            svc = arr?.[0] || null;
          }
        }
      }
    }
    if (!svc) {
      const r = await fetch(`${API_BASE}/support?_limit=1`);
      if (r.ok) {
        const arr = await r.json();
        svc = arr?.[0] || null;
      }
    }

    service.value = svc;

    const raw = service.value?.required_documents || '';
    docItems.value = parseLines(raw);

    // 이전 선택 복원
    selected.value = store.support?.docs?.selected || [];
  } catch (e) {
    console.error('서비스 로드 실패:', e);
    service.value = null;
    docItems.value = [];
  } finally {
    loading.value = false;
  }
}

function goNext() {
  // 선택 결과 저장
  store.support = {
    ...store.support,
    currentServiceId: service.value?.service_id || currentId.value || null,
    docs: {
      ...(store.support?.docs || {}),
      selected: [...selected.value],
    },
  };

  // 간단한 상태 계산(선정기준 + 서류)
  const criteriaCount = (store.support?.criteria?.selected || []).length;
  const docsCount = (store.support?.docs?.selected || []).length;
  const totalReq = docItems.value?.length || 0;
  // 예시 로직: 서류 모두 준비 + 기준 일부라도 체크 → eligible, 일부 빠짐 → caution, 전혀 아님 → ineligible
  let status = 'ineligible';
  if (criteriaCount > 0 && docsCount === totalReq) status = 'eligible';
  else if (criteriaCount > 0 || docsCount > 0) status = 'caution';

  const product = service.value?.service_name || '지원금';
  router.push({
    path: '/financial/result',
    query: { status, product },
  });
}

onMounted(loadService);
</script>

<style scoped>
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
  gap: 1rem;
  margin-top: 1rem;
}

.placeholder-box {
  padding: 0.75rem 1rem;
  border: 1px dashed var(--color-lightgray);
  border-radius: 12px;
  color: var(--color-darkgray);
}

/* 체크리스트 */
.checklist {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}
.row {
  display: flex;
  align-items: center;
}

.check {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  padding: 0.25rem 0;
}

.native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* 라벨: 기본 회색, 체크되면 진한 검정 */
.label {
  color: #8e8e95;
  transition: color 0.15s ease;
}
.native:checked ~ .label {
  color: var(--color-black);
}

/* 오른쪽 벡터 아이콘 (미체크 / 체크) */
.icon {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  background-image: url("data:image/svg+xml;utf8,\<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239EA2A8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/></svg>");
}
.native:checked ~ .icon {
  background-image: url("data:image/svg+xml;utf8,\<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%230E0B80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/><path d='M8 12l3 3 5-5'/></svg>");
}
.native:focus-visible ~ .icon {
  outline: 2px solid var(--color-primary-10);
  outline-offset: 2px;
}

/* CTA */
.cta-wrap {
  margin-top: auto;
}
.cta-spacer {
  height: 1.185rem;
}
</style>
