<template>
  <div class="page">
    <SimpleHeader title="대출·지원금" />
    <TopMessage
      class="px"
      :prefix="'확인하고 싶은'"
      :suffix="'을 선택해주세요'"
    >
      <template #highlight>
        <SelectField
          class="inline-select"
          v-model="mode"
          :items="modeItems"
          placeholder="종류 선택"
          :max-list-height="220"
        />
      </template>
    </TopMessage>

    <!-- ✨ 공통 컴포넌트 사용 -->
    <SearchSuggest
      v-model="keyword"
      :placeholder="placeholder"
      :get-suggestions="getSuggestions"
      @submit="doSearch"
      @select="doSearch"
      :label-key="labelKey"
      :value-key="valueKey"
    />

    <div class="list-link bodyLight12px" @click="goList">
      대출·지원금 목록 보기
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import TopMessage from './components/TopMessage.vue';
import SearchSuggest from './components/SearchSuggest.vue';
import SelectField from '../../components/common/SelectField.vue';
import { useFinancialStore } from '@/stores/financial';

const store = useFinancialStore();
const router = useRouter();

/* 모드 항목 */
const modeItems = [
  { label: '지원금', value: 'support' },
  { label: '대출', value: 'loan' },
];

/* store.mode 와 양방향 바인딩 (getter/setter) */
const mode = computed({
  get: () => store.mode || '',
  set: (v) => store.setMode(v),
});

const keyword = ref('');

// SearchSuggest에 labelKey, valueKey 전달
const labelKey = computed(() =>
  store.mode === 'loan' ? '상품명' : 'service_name'
);
const valueKey = computed(() =>
  store.mode === 'loan' ? '상품ID' : 'service_id'
);

// 검색/선택 처리: 사용자 기대대로 '흐름 시작'이 되게 함
// - 텍스트 입력(submit): 검색어를 세션에 저장하고 목록으로 이동
// - 항목 선택(object): 지원이면 기본정보 폼(start flow), 대출이면 대출 기본정보로 이동
function doSearch(row) {
  if (!row) return;

  // 사용자가 직접 입력한 검색어: 목록으로 이동하여 검색 결과/필터를 보여줌
  if (typeof row === 'string') {
    const kw = row.trim();
    if (!kw) return;
    sessionStorage.setItem('financial-keyword', kw);
    // 목록 페이지가 검색어를 반영하므로 목록으로 이동
    router.push('/financial/list');
    return;
  }

  // 항목 선택: support -> 지원금 흐름 시작, loan -> 대출 흐름 시작
  const id = row[valueKey.value];
  if (!id) return;

  if (store.mode === 'support') {
    // support 폼들에서는 ?id 쿼리를 사용하여 해당 서비스를 불러옵니다
    router.push({ path: '/financial/support-basic', query: { id: id } });
    return;
  }

  if (store.mode === 'loan') {
    // 대출은 기본정보 폼으로 이동 (필요 시 쿼리로 상품 id 전달)
    router.push({ path: '/financial/loan-basic', query: { id: id } });
    return;
  }
}

/* 이하 기존 검색/추천 로직은 그대로 사용 */
const API_BASE = 'http://localhost:3000';
const endpoints = { loan: `${API_BASE}/loan`, support: `${API_BASE}/support` };
const cache = { loan: null, support: null };

function pickTitle(mode, row) {
  return mode === 'loan' ? row['상품명'] : row['service_name'];
}

// row 전체 반환
async function getSuggestions(q) {
  if (!store.mode) return [];
  const url = new URL(endpoints[store.mode]);
  url.searchParams.set('_limit', '1000');
  if (q) url.searchParams.set('q', q);
  const res = await fetch(url.toString());
  const data = await res.json();
  return (data || []).filter(Boolean);
}

const goList = () => router.push('/financial/list');
</script>

<style scoped>
.field {
  position: relative;
  display: inline-flex; /* 문장 안이라면 inline-flex */
  align-items: baseline; /* 텍스트 기준 맞춤 */
  border-bottom: 1px solid #e6e6eb;
  height: auto; /* 고정 높이 제거 */
  padding: 0; /* 혹시 기본 패딩도 같이 제거 */
}

.inline-select :deep(.text) {
  color: var(--color-primary); /* .hl 과 동일 */
  font-weight: 700; /* .hl 과 동일 */
  font-size: 1.5rem; /* 필요하면 유지 */
  line-height: 1; /* 글자 붙이려면 */
}

/* 나머지 기존 스타일 유지 */
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
.search {
  padding: 0 1.25rem;
  margin-top: 1rem;
}
.search-wrap {
  position: relative;
  width: 100%;
}
.search-input {
  width: 100%;
  height: 3rem;
  padding: 0 3rem 0 1rem;
  border: 2px solid var(--color-primary);
  border-radius: 12px;
  background: #fff;
  outline: none;
  font-size: 1rem;
}
.icon-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.suggestion-list {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 0.5rem);
  z-index: 15;
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
  background: #fff;
  border: 2px solid var(--color-primary);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.suggestion-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  line-height: 1.5;
}
.search-badge {
  width: 1.4rem;
  height: 1.4rem;
  min-width: 1.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--color-primary);
  color: #fff;
  flex-shrink: 0;
}
.list-link {
  text-align: center;
  margin-top: auto;
  margin-bottom: 1rem;
  color: var(--color-darkgray);
  font-size: 0.8rem;
  line-height: 1.4;
  text-decoration: underline;
  cursor: pointer;
}
</style>
