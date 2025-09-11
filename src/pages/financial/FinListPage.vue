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
      :label-key="store.mode === 'loan' ? 'loanName' : 'serviceName'"
      :initial-max="5"
      :max="12"
      @submit="onSubmitSearch"
      @filter="openFilter = true"
    />

    <!-- 결과 리스트 -->
    <section class="results">
      <ListItemCard
        v-for="it in items"
        :key="store.mode === 'loan' ? it.loanId || it.id : it.serviceId"
        :title="getTitle(it)"
        :desc="getDesc(it)"
        :item="it"
        @click="goDetail(it)"
      />

      <div class="more-wrap" v-if="hasMore">
        <button class="more-btn" @click="loadMore" :disabled="loading">
          {{ loading ? '불러오는 중…' : '더보기' }}
        </button>
      </div>
      <div v-if="!loading && items.length === 0" class="empty bodyLight12px px">
        조건에 맞는 항목이 없어요.
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
import * as grants from '@/api/grants';
import * as loans from '@/api/loan';
import BottomNavSpace from '@/components/layout/Footer.vue';

const store = useFinancialStore();
const router = useRouter();

// 서버 API 사용 (mock 제거)

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
    const status = r.serviceStatus ?? r['service_status'] ?? '';
    const loc = String(r.location ?? r['location'] ?? '');
    const industry = String(r.industry ?? r['industry'] ?? '');

    const okStatus =
      !f.status ||
      String(status).replace(/\s+/g, '') ===
        String(f.status).replace(/\s+/g, '');
    const okSido = !f.sido || loc.includes(f.sido);
    const okSigungu = !f.sigungu || loc.includes(f.sigungu);
    const okIndustry = !f.industry || industry.includes(f.industry);
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
    const eligible = r.eligibleGroup ?? r['가입대상'] ?? '';
    const loanType = r.loanType ?? r['담보여부'] ?? '';
    const interest = r.interestType ?? r['금리방식'] ?? '';
    const repay = (r.repaymentMethod ?? r['상환방식'] ?? '').toString();

    const okTarget =
      !f.target ||
      (function mapTarget(s) {
        const v = String(s).replace(/\s+/g, '');
        if (v.includes('개인사업자')) return '개인 사업자';
        if (v.includes('셀러') || v.includes('온라인')) return '온라인셀러';
        return '기타';
      })(eligible) === f.target;

    const okCollateral =
      !f.collateral ||
      (f.collateral === '담보대출' && String(loanType).includes('담보')) ||
      (f.collateral === '신용대출' && String(loanType).includes('신용'));

    const okRate =
      !f.rate ||
      (f.rate === '고정금리' && String(interest).includes('고정')) ||
      (f.rate === '변동금리' && String(interest).includes('변동'));

    const okRepay =
      !f.repay ||
      (f.repay === '만기일시' && repay.includes('만기일시')) ||
      (f.repay === '원리금균등' && repay.includes('원리금')) ||
      (f.repay === '원금균등' && repay.includes('원금'));

    return okTarget && okCollateral && okRate && okRepay;
  });
}

function getTitle(row) {
  if (!row) return '';
  if (store.mode === 'loan')
    return String(row.loanName ?? row['상품명'] ?? row.name ?? row.title ?? '');
  return String(row.serviceName ?? row['service_name'] ?? row.name ?? '');
}
function getDesc(row) {
  if (!row) return '';
  if (store.mode === 'loan') {
    const parts = [
      row.loanCompany,
      row.eligibleGroup,
      row.interestType,
      row.repaymentMethod,
    ].filter(Boolean);
    return parts.join(' · ');
  }
  const parts = [
    row.industry ?? row['industry'],
    row.location ?? row['location'],
    row.serviceStatus ?? row['service_status'],
  ].filter(Boolean);
  return parts.join(' · ');
}

/* ---- 응답 정규화(필드 케이스 보정) ---- */
function normalizeSupportRow(r = {}) {
  return {
    ...r,
    serviceId: r.serviceId ?? r.service_id ?? r.id,
    serviceName: r.serviceName ?? r.service_name ?? r.name ?? r.title,
    serviceStatus: r.serviceStatus ?? r.service_status,
  };
}
function normalizeLoanRow(r = {}) {
  return {
    ...r,
    loanId: r.loanId ?? r.id ?? r.loan_id,
    loanName: r.loanName ?? r['상품명'] ?? r.name ?? r.title,
    loanCompany:
      r.loanCompany ?? r.loan_company ?? r['loan_company'] ?? r.company ?? '',
    eligibleGroup: r.eligibleGroup ?? r['가입대상'],
    interestType: r.interestType ?? r['금리방식'],
    repaymentMethod: r.repaymentMethod ?? r['상환방식'],
  };
}
function normalizeList(mode, arr = []) {
  if (!Array.isArray(arr)) return [];
  return mode === 'loan'
    ? arr.map(normalizeLoanRow)
    : arr.map(normalizeSupportRow);
}

/* ---- 자동완성 ---- */
async function getSuggestions(q) {
  if (!store.mode) return [];
  let arr = [];
  try {
    if (store.mode === 'loan') {
      arr = normalizeList('loan', (await loans.searchLoans(q || '')) || []);
    } else {
      if (!q) {
        arr = normalizeList('support', (await grants.getTop5Grants()) || []);
      } else {
        arr = normalizeList(
          'support',
          (await grants.searchGrants(q || '')) || []
        );
      }
    }
  } catch {
    arr = [];
  }

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
    let arr = [];
    try {
      if (store.mode === 'loan') {
        // 서버 필터 API 사용
        const f = store.loanFilters || {};
        arr = normalizeList(
          'loan',
          (await loans.filterLoans({
            eligibleGroup: f.target || undefined,
            loanType:
              f.collateral === '담보대출'
                ? '담보'
                : f.collateral === '신용대출'
                ? '신용'
                : undefined,
            interestType: f.rate || undefined,
            repaymentMethod: f.repay || undefined,
          })) || []
        );
      } else {
        // 서버 필터 API 사용 (location = 시도 + 시군구)
        const f = store.supportFilters || {};
        const locationParam = f.sigungu
          ? `${f.sido || ''} ${f.sigungu}`.trim()
          : f.sido || '';
        arr = normalizeList(
          'support',
          (await grants.filterGrants({
            serviceStatus: f.status || undefined,
            location: locationParam || undefined,
            industry: f.industry || undefined,
          })) || []
        );
      }
    } catch {
      arr = [];
    }

    const start = (page.value - 1) * pageSize;
    const slice = arr.slice(start, start + pageSize);

    items.value.push(...slice);
    hasMore.value = start + slice.length < arr.length;
    if (hasMore.value) page.value += 1;

    loading.value = false;
    return;
  }

  // 필터 OFF → 서버 페이지네이션 그대로 사용 (단, 현재 백엔드 스펙에 맞춰 간단 페이징)
  try {
    let arr = [];
    if (store.mode === 'loan') {
      arr = normalizeList('loan', (await loans.searchLoans(q || '')) || []);
    } else {
      if (q) {
        arr = normalizeList('support', (await grants.searchGrants(q)) || []);
      } else {
        const f = store.supportFilters || {};
        const locationParam = f.sigungu
          ? `${f.sido || ''} ${f.sigungu}`.trim()
          : f.sido || '';
        arr = normalizeList(
          'support',
          (await grants.filterGrants({
            serviceStatus: f.status || undefined,
            location: locationParam || undefined,
            industry: f.industry || undefined,
          })) || []
        );
      }
    }
    const start = (page.value - 1) * pageSize;
    const slice = arr.slice(start, start + pageSize);
    items.value.push(...slice);
    hasMore.value = start + slice.length < arr.length;
    if (hasMore.value) page.value += 1;
  } catch {
    hasMore.value = false;
  }

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
    // 드롭다운에서 항목 선택 시: ID가 있으면 바로 상세로 이동
    const loanId = payload.loanId ?? payload.id ?? null;
    const serviceId = payload.serviceId ?? null;
    if (store.mode === 'loan' && loanId) {
      router.push({ path: '/financial/loan-detail', query: { id: loanId } });
      return;
    }
    if (store.mode === 'support' && serviceId) {
      router.push({
        path: '/financial/support-detail',
        query: { id: serviceId },
      });
      return;
    }
    // ID가 없으면 제목 기반 검색 수행
    q = String(
      payload['serviceName'] ??
        payload['loanName'] ??
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

// 새로 진입할 때마다 검색/필터/페이지 상태 초기화
function resetAllState() {
  store.$patch({
    search: '',
    supportFilters: { status: '', sido: '', sigungu: '', industry: '' },
    loanFilters: { target: '', collateral: '', rate: '', repay: '' },
  });
  searchLocal.value = '';
  openFilter.value = false;
  page.value = 1;
  items.value = [];
  hasMore.value = true;
}

function goDetail(row) {
  const loanId =
    row?.loanId ?? row?.id ?? row?.['상품ID'] ?? row?.loan_id ?? null;
  const supportId = row?.serviceId ?? row?.service_id ?? null;
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
  resetAllState();
  searchLocal.value = '';
  if (!store.mode) store.setMode('support');
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
