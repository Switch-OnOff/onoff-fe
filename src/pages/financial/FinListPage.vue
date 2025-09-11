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
      :has-filter="true"
      :filter-active="hasActiveFilter || openFilter"
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

    <!-- 필터 시트: 지원금 -->
    <FilterSheet v-model:open="openFilter" v-if="store.mode === 'support'">
      <SupportFilterPanel />
      <div class="px pb16">
        <button class="apply-btn" @click="applyAndReload">필터 적용</button>
        <button class="reset-btn" @click="resetFilters">초기화</button>
      </div>
    </FilterSheet>

    <!-- 필터 시트: 대출 -->
    <FilterSheet v-model:open="openFilter" v-else-if="store.mode === 'loan'">
      <LoanFilterPanel />
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
import LoanFilterPanel from './components/LoanFilterPanel.vue';
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

/* ---- 필터 활성 여부 ---- */
const hasActiveSupport = computed(() => {
  if (store.mode !== 'support') return false;
  const f = store.supportFilters || {};
  return !!(f.status || f.sido || f.sigungu || f.industry);
});

const hasActiveLoan = computed(() => {
  if (store.mode !== 'loan') return false;
  const f = store.loanFilters || {};
  return !!(f.target || f.collateral || f.rate || f.repay);
});

const hasActiveFilter = computed(
  () => hasActiveSupport.value || hasActiveLoan.value
);

/* ---- 유틸 ---- */
const norm = (s = '') => String(s).replace(/\s+/g, '');
const has = (s, kw) => norm(s).includes(norm(kw));

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

/* 가입대상 맵핑: 데이터가 제각각이라 대충 규칙화 */
function mapLoanTarget(s) {
  const v = norm(s);
  if (v.includes('개인사업자')) return '개인 사업자';
  if (v.includes('셀러') || v.includes('온라인')) return '온라인셀러';
  return '기타';
}

function applyLoanFilters(list) {
  const f = store.loanFilters || {};
  return list.filter((r) => {
    const okTarget = !f.target || mapLoanTarget(r['가입대상']) === f.target;
    const okCollateral =
      !f.collateral ||
      (f.collateral === '담보대출' && has(r['담보여부'], '담보')) ||
      (f.collateral === '신용대출' && has(r['담보여부'], '신용'));
    const okRate =
      !f.rate ||
      (f.rate === '고정금리' && has(r['금리방식'], '고정')) ||
      (f.rate === '변동금리' && has(r['금리방식'], '변동'));
    const repayStr = norm(r['상환방식']);
    const okRepay =
      !f.repay ||
      (f.repay === '만기일시' && repayStr.includes('만기일시')) ||
      (f.repay === '원금분할' && repayStr.includes('원금분할')) ||
      (f.repay === '원리금분할' && repayStr.includes('원리금분할'));
    return okTarget && okCollateral && okRate && okRepay;
  });
}

function getTitle(row) {
  return store.mode === 'loan' ? row['상품명'] : row['service_name'];
}
function getDesc(row) {
  return row['요약'] || row['summary'] || '';
}

/* ---- 자동완성 ---- */
async function getSuggestions(q) {
  if (!store.mode) return [];
  const url = new URL(endpoints[store.mode]);
  url.searchParams.set('_limit', '1500');
  if (q) url.searchParams.set('q', q);

  const r = await fetch(url.toString());
  if (!r.ok) return [];
  let arr = await r.json();

  // 모드별 필터 적용
  if (store.mode === 'support' && hasActiveSupport.value)
    arr = applySupportFilters(arr);
  if (store.mode === 'loan' && hasActiveLoan.value) arr = applyLoanFilters(arr);

  // 중복 제목 제거 후 12개
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

/* ---- 리스트 로드 ---- */
async function loadList() {
  if (!store.mode) store.setMode('loan');
  page.value = 1;
  items.value = [];
  hasMore.value = true;
  await loadMore();
}

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;

  const q = (searchLocal.value || store.search || '').trim();

  // 지원금/대출 모두, 필터가 켜져 있으면 클라단 페이징
  if (
    (store.mode === 'support' && hasActiveSupport.value) ||
    (store.mode === 'loan' && hasActiveLoan.value)
  ) {
    const url = new URL(endpoints[store.mode]);
    url.searchParams.set('_limit', '3000');
    if (q) url.searchParams.set('q', q);

    const r = await fetch(url.toString());
    let arr = await r.json();
    arr =
      store.mode === 'support'
        ? applySupportFilters(arr)
        : applyLoanFilters(arr);

    const start = (page.value - 1) * pageSize;
    const slice = arr.slice(start, start + pageSize);

    items.value.push(...slice);
    hasMore.value = start + slice.length < arr.length;
    if (hasMore.value) page.value += 1;

    loading.value = false;
    return;
  }

  // 필터 OFF → 서버 페이지네이션 그대로 사용
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

/* ---- 이벤트 ---- */
function onChangeMode(m) {
  store.setMode(m);
  loadList();
}

function onSubmitSearch(payload) {
  let q = '';
  if (typeof payload === 'string') {
    q = payload.trim();
  } else if (payload && typeof payload === 'object') {
    q = String(
      payload['service_name'] ??
        payload['상품명'] ??
        payload['name'] ??
        payload['title'] ??
        ''
    ).trim();
  } else {
    q = (searchLocal.value || '').trim();
  }
  searchLocal.value = q;
  store.search = q;
  loadList();
}

function applyAndReload() {
  openFilter.value = false;
  loadList();
}

function resetFilters() {
  if (store.mode === 'support') {
    store.$patch({
      supportFilters: { status: '', sido: '', sigungu: '', industry: '' },
    });
  } else {
    store.$patch({
      loanFilters: { target: '', collateral: '', rate: '', repay: '' },
    });
  }
}

function goDetail(row) {
  const loanId = row?.id ?? row?.['상품ID'] ?? row?.loan_id ?? null;
  const supportId = row?.service_id ?? null;
  const title = getTitle(row);

  if (store.mode === 'loan') {
    if (loanId)
      router.push({ path: '/financial/loan-detail', query: { id: loanId } });
    else {
      if (title) sessionStorage.setItem('financial-keyword', title);
      router.push('/financial/loan-detail');
    }
    return;
  }
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
