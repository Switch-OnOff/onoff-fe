<!-- src/pages/financial/FinancialListPage.vue -->
<template>
  <div class="page">
    <SimpleHeader title="대출·지원금" />

    <ModeTabs :model="store.mode" @update:model="onChangeMode" />

    <SearchSuggest
      v-model="searchLocal"
      :placeholder="
        store.mode === 'loan' ? '대출을 검색해보세요' : '지원금을 검색해보세요'
      "
      :get-suggestions="getSuggestions"
      :show-dropdown="true"
      :has-filter="true"
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
    </section>

    <BottomNavSpace />

    <!-- 필터 시트 -->
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
const endpoints = {
  loan: `${API_BASE}/loan`,
  support: `${API_BASE}/support`,
};

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

function getTitle(row) {
  return store.mode === 'loan' ? row['상품명'] : row['service_name'];
}
function getDesc(row) {
  return row['요약'] || row['summary'] || '';
}

function applySupportFilters(list) {
  const f = store.supportFilters || {};
  const norm = (s = '') => String(s).replace(/\s+/g, '');
  return list.filter((r) => {
    const okStatus = !f.status || norm(r.service_status) === norm(f.status);
    const okSido = !f.sido || String(r.location || '').includes(f.sido);
    const okSigungu =
      !f.sigungu || String(r.location || '').includes(f.sigungu);
    const okIndustry =
      !f.industry || String(r.industry || '').includes(f.industry);
    return okStatus && okSido && okSigungu && okIndustry;
  });
}

/** 첫 페이지부터 다시 로드 */
async function loadList() {
  page.value = 1;
  items.value = [];
  hasMore.value = true;
  await loadMore();
}

/** 다음 페이지 추가 로드 */
async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;

  const url = new URL(endpoints[store.mode]);
  url.searchParams.set('_page', String(page.value));
  url.searchParams.set('_limit', String(pageSize));
  const q = searchLocal.value || store.search || '';
  if (q) url.searchParams.set('q', q);

  const r = await fetch(url);
  let arr = await r.json();

  if (store.mode === 'support') arr = applySupportFilters(arr);

  const total = Number(r.headers.get('X-Total-Count') || 0);
  items.value.push(...arr);

  // 필터로 개수가 줄 수 있으니 “받아온 개수 === pageSize” 기준으로 hasMore 판정
  hasMore.value =
    arr.length === pageSize && (total === 0 || items.value.length < total);
  if (hasMore.value) page.value += 1;

  loading.value = false;
}

function onChangeMode(m) {
  store.setMode(m);
  loadList();
}

function onSubmitSearch() {
  store.search = searchLocal.value;
  loadList();
}

function applyAndReload() {
  openFilter.value = false;
  loadList();
}

function resetFilters() {
  store.supportFilters = { status: '', sido: '', sigungu: '', industry: '' };
}

function goDetail(row) {
  if (store.mode === 'loan') router.push('/financial/loan-basic');
  else
    router.push({
      path: '/financial/support-basic',
      query: { id: row.service_id },
    });
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

.searchbar {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}

.field {
  height: 44px;
  border: 1px solid var(--color-lightgray);
  border-radius: 9999px;
  padding: 0 14px;
  font-size: 14px;
  outline: none;
}

.icon {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  border: 1px solid var(--color-lightgray);
  background: #fff;
}
.icon.active {
  border-color: var(--color-primary);
}

.results {
  margin-top: 8px;
  border-top: 1px solid #eee;
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
</style>
