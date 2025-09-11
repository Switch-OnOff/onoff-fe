<!-- src/pages/financial/FinancialListPage.vue -->
<template>
  <div class="page">
    <SimpleHeader title="대출·지원금" />

    <ModeTabs class="mt16" :model="store.mode" @update:model="onChangeMode" />

    <SearchSuggest
      v-model="searchLocal"
      :placeholder="
        store.mode === 'loan' ? '대출을 검색해보세요' : '지원금을 검색해보세요'
      "
      :get-suggestions="getSuggestions"
      :show-dropdown="true"
      :has-filter="store.mode === 'support'"
      :filter-active="hasActiveFilter"
      :label-key="store.mode === 'loan' ? '상품명' : 'service_name'"
      :initial-max="5"
      :max="12"
      @submit="onSubmitSearch"
      @filter="openFilter = true"
    />

    <!-- 결과 리스트 -->
    <section class="results">
      <ListItemCard
        v-for="it in items"
        :key="store.mode === 'loan' ? it.id || it['상품명'] : it.service_id"
        :title="getTitle(it)"
        :desc="getDesc(it)"
        @click="goDetail(it)"
      />
      <div class="more-wrap" v-if="hasMore">
        <button class="more-btn" @click="loadMore" :disabled="loading">
          {{ loading ? '불러오는 중…' : '더보기' }}
        </button>
      </div>
      <div v-if="!loading && items.length === 0" class="empty bodyLight12px px">
        조건에 맞는 항목이 없어요. 필터를 줄이거나 검색어를 바꿔봐.
      </div>
    </section>

    <BottomNavSpace />

    <!-- 필터 시트(지원금 전용) -->
    <FilterSheet v-model:open="openFilter" v-if="store.mode === 'support'">
      <SupportFilterPanel />
      <div class="px pb16">
        <button class="apply-btn" @click="applyAndReload">필터 적용</button>
        <button class="reset-btn" @click="resetFilters">초기화</button>
      </div>
    </FilterSheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFinancialStore } from '@/stores/financial';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import ModeTabs from './components/ModeTabs.vue';
import SearchSuggest from './components/SearchSuggest.vue';
import SupportFilterPanel from './components/SupportFilterPanel.vue';
import ListItemCard from './components/ListItemCard.vue';
import FilterSheet from './components/FilterSheet.vue';

const store = useFinancialStore();
const router = useRouter();

const API_BASE = 'http://localhost:3000';
const endpoints = { loan: `${API_BASE}/loan`, support: `${API_BASE}/support` };

const items = ref([]);
const page = ref(1);
const pageSize = 20;
const hasMore = ref(true);
const loading = ref(false);

const searchLocal = ref('');
const openFilter = ref(false);

const hasActiveFilter = computed(() => {
  if (store.mode !== 'support') return false;
  const f = store.supportFilters || {};
  return !!(f.status || f.sido || f.sigungu || f.industry);
});

const norm = (s = '') => String(s).replace(/\s+/g, '');

function applySupportFilters(list) {
  const f = store.supportFilters || {};
  return list.filter((r) => {
    const okStatus = !f.status || norm(r.service_status) === norm(f.status);
    const loc = String(r.location || '');
    const okSido = !f.sido || loc.includes(f.sido);
    const okSigungu = !f.sigungu || loc.includes(f.sigungu);
    const okIndustry =
      !f.industry || String(r.industry || '').includes(f.industry);
    return okStatus && okSido && okSigungu && okIndustry;
  });
}

function getTitle(row) {
  return store.mode === 'loan' ? row['상품명'] : row['service_name'];
}
function getDesc(row) {
  return row['요약'] || row['summary'] || '';
}

// 자동완성: 넉넉히 가져와서(1500) 중복제거 후 12개만
async function getSuggestions(q) {
  if (!store.mode) return [];
  const url = new URL(endpoints[store.mode]);
  url.searchParams.set('_limit', '1500');
  if (q) url.searchParams.set('q', q);

  const r = await fetch(url.toString());
  if (!r.ok) return [];
  let arr = await r.json();
  if (store.mode === 'support') arr = applySupportFilters(arr);

  const seen = new Set();
  const res = [];
  for (const it of arr) {
    const t = getTitle(it);
    if (!t || seen.has(t)) continue;
    seen.add(t);
    res.push(it);
    if (res.length >= 12) break;
  }
  return res;
}

async function loadList() {
  if (!store.mode) store.setMode('loan'); // 기본값 가드
  page.value = 1;
  items.value = [];
  hasMore.value = true;
  await loadMore();
}

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;

  const q = (searchLocal.value || store.search || '').trim();

  // 지원금 + 필터 ON → 클라 페이지
  if (store.mode === 'support' && hasActiveFilter.value) {
    const url = new URL(endpoints.support);
    url.searchParams.set('_limit', '3000');
    if (q) url.searchParams.set('q', q);

    const r = await fetch(url.toString());
    let arr = await r.json();
    arr = applySupportFilters(arr);

    const start = (page.value - 1) * pageSize;
    const slice = arr.slice(start, start + pageSize);

    items.value.push(...slice);
    hasMore.value = start + slice.length < arr.length;
    if (hasMore.value) page.value += 1;

    loading.value = false;
    return;
  }

  // 대출 또는 필터 OFF → 서버 페이지네이션
  const base = new URL(endpoints[store.mode]);
  base.searchParams.set('_page', String(page.value));
  base.searchParams.set('_limit', String(pageSize));
  if (q) base.searchParams.set('q', q);

  const r = await fetch(base.toString());
  const arr = await r.json();

  items.value.push(...arr);

  const total = Number(r.headers.get('X-Total-Count') || 0);
  hasMore.value =
    arr.length === pageSize && (total === 0 || items.value.length < total);
  if (hasMore.value) page.value += 1;

  loading.value = false;
}

function onChangeMode(m) {
  store.setMode(m);
  loadList();
}

function onSubmitSearch(payload) {
  // payload가 '문자열'(직접 입력)일 수도, '객체'(추천 클릭)일 수도 있음
  let q = '';

  if (typeof payload === 'string') {
    q = payload.trim();
  } else if (payload && typeof payload === 'object') {
    // 객체면 라벨 키 우선순위로 뽑아서 문자열화
    q =
      payload['service_name'] ??
      payload['상품명'] ??
      payload['name'] ??
      payload['title'] ??
      '';
    q = String(q).trim();
  } else {
    q = (searchLocal.value || '').trim();
  }

  // v-model, store 둘 다 동기화
  searchLocal.value = q;
  store.search = q;

  // 검색 실행
  loadList();
}

function applyAndReload() {
  openFilter.value = false;
  loadList();
}

function resetFilters() {
  // 객체 통째 교체 대신 patch 권장 (반응성 안전)
  store.$patch({
    supportFilters: { status: '', sido: '', sigungu: '', industry: '' },
  });
}

function goDetail(row) {
  // 공통으로 id/제목 뽑기
  const loanId = row?.id ?? row?.['상품ID'] ?? row?.loan_id ?? null;
  const supportId = row?.service_id ?? null;
  const title = getTitle(row); // '상품명' or 'service_name'

  if (store.mode === 'loan') {
    if (loanId) {
      router.push({ path: '/financial/loan-detail', query: { id: loanId } });
    } else {
      if (title) sessionStorage.setItem('financial-keyword', title);
      router.push('/financial/loan-detail');
    }
    return;
  }

  // support
  if (supportId) {
    router.push({
      path: '/financial/support-detail',
      query: { id: supportId },
    });
  } else {
    if (title) sessionStorage.setItem('financial-keyword', title);
    router.push('/financial/support-detail');
  }
}

onMounted(() => {
  searchLocal.value = store.search || '';
  loadList();
});
</script>

<style scoped>
.px {
  padding: 0 1.25rem;
}
.pb16 {
  padding-bottom: 1rem;
}

.mt16 {
  margin-top: 1rem;
}

.results {
  margin-top: 8px;
  border-top: 1px solid #eee;
  min-height: 40vh;
}
.more-wrap {
  display: flex;
  justify-content: center;
  padding: 12px 0 24px;
}
.more-btn {
  padding: 0.6rem 1rem;
  border: 1px solid var(--color-primary);
  border-radius: 9999px;
  background: #fff;
  color: var(--color-primary);
}
.more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.apply-btn,
.reset-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  margin-top: 8px;
}
.apply-btn {
  background: var(--color-primary);
  color: #fff;
}
.reset-btn {
  background: #f5f5f5;
}

.empty {
  text-align: center;
  color: #888;
  padding: 24px 0 40px;
}
</style>
