<template>
  <div class="page">
    <SimpleHeader title="대출·지원금" />

    <!-- 상단 템플릿의 드롭다운 부분 교체 -->
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

    <!-- 검색창 -->
    <div class="search">
      <div class="search-wrap">
        <input
          type="text"
          v-model="keyword"
          :placeholder="placeholder"
          @focus="onFocus"
          @blur="onBlur"
          @input="onInput"
          @keyup.enter="doSearch"
          class="search-input"
          inputmode="search"
          aria-autocomplete="list"
          :aria-expanded="showSuggest"
        />

        <button
          class="icon-btn"
          type="button"
          @click="doSearch"
          aria-label="검색"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <!-- 추천 리스트 -->
        <ul v-if="showSuggest" class="suggestion-list" role="listbox">
          <li
            class="bodyMedium16px"
            v-for="(item, i) in suggestions"
            :key="i"
            role="option"
            @mousedown.prevent="selectSuggestion(item)"
          >
            <span class="search-badge" aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            {{ item }}
          </li>

          <li v-if="loading" class="bodyLight12px" style="padding: 0.5rem 1rem">
            불러오는 중…
          </li>
          <li
            v-if="!loading && suggestions.length === 0"
            class="bodyLight12px"
            style="padding: 0.5rem 1rem"
          >
            결과 없음
          </li>
        </ul>
      </div>
    </div>

    <div class="list-link bodyLight12px" @click="goList">
      대출·지원금 목록 보기
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import TopMessage from './components/TopMessage.vue';
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

/* ---- 기존 드롭다운 관련 상태/함수들은 전부 삭제하세요 ---- */
/* open, dropdownRoot, toggle, onClickOutside, onKeyEsc 등 제거 */

/* 이하 기존 검색/추천 로직은 그대로 사용 */
const API_BASE = 'http://localhost:3000';
const endpoints = { loan: `${API_BASE}/loan`, support: `${API_BASE}/support` };
const cache = { loan: null, support: null };

function pickTitle(mode, row) {
  return mode === 'loan' ? row['상품명'] : row['service_name'];
}

const keyword = ref('');
const focused = ref(false);
const suggestions = ref([]);
const loading = ref(false);
let blurTimer = null;
let debounceTimer = null;

const placeholder = computed(() => {
  if ('searchPlaceholder' in store && store.searchPlaceholder)
    return store.searchPlaceholder;
  if (!store.mode) return '지원금/대출을 먼저 선택하세요';
  return store.mode === 'support'
    ? '지원금을 검색해보세요'
    : '대출을 검색해보세요';
});

const showSuggest = computed(() => focused.value && !!store.mode);

async function loadTitles(m) {
  if (!m) return;
  if (cache[m]) return;
  loading.value = true;
  try {
    const res = await fetch(`${endpoints[m]}?_limit=1000`);
    const data = await res.json();
    cache[m] = data.map((r) => pickTitle(m, r)).filter(Boolean);
  } catch {
    cache[m] = [];
  } finally {
    loading.value = false;
    updateSuggestions();
  }
}

watch(
  () => store.mode,
  (m) => {
    keyword.value = '';
    suggestions.value = [];
    if (m) loadTitles(m);
  }
);

function onFocus() {
  focused.value = true;
  updateSuggestions();
}
function onBlur() {
  blurTimer && clearTimeout(blurTimer);
  blurTimer = setTimeout(() => {
    focused.value = false;
  }, 80);
}
function onInput() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updateSuggestions, 80);
}

function updateSuggestions() {
  if (!store.mode) {
    suggestions.value = [];
    return;
  }
  const list = cache[store.mode] || [];
  const q = keyword.value.trim().toLowerCase();
  suggestions.value = !q
    ? list.slice(0, 5)
    : list.filter((v) => v.toLowerCase().includes(q)).slice(0, 5);
}

function selectSuggestion(item) {
  keyword.value = item;
  focused.value = false;
  doSearch();
}

async function resolveSupportIdByName(name) {
  if (!name) return null;
  let r = await fetch(
    `${API_BASE}/support?service_name=${encodeURIComponent(name)}&_limit=1`
  );
  if (r.ok) {
    const arr = await r.json();
    if (arr?.[0]?.service_id) return arr[0].service_id;
  }
  r = await fetch(
    `${API_BASE}/support?service_name_like=${encodeURIComponent(name)}&_limit=1`
  );
  if (r.ok) {
    const arr = await r.json();
    return arr?.[0]?.service_id || null;
  }
  return null;
}

async function doSearch() {
  if (!store.mode) {
    alert('먼저 지원금/대출을 선택하세요!');
    return;
  }
  const q = keyword.value.trim();
  sessionStorage.setItem('financial-keyword', q);
  if (store.mode === 'support') {
    const id = await resolveSupportIdByName(q);
    router.push({
      path: '/financial/support-basic',
      query: id ? { id } : undefined,
    });
  } else {
    router.push('/financial/loan-basic');
  }
}

function goList() {
  router.push({
    path: '/financial/result',
    query: { mode: store.mode || 'support', list: '1' },
  });
}

onMounted(() => {
  if (store.mode) loadTitles(store.mode);
});
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
