<template>
  <div class="page">
    <SimpleHeader title="대출·지원금" />

    <TopMessage
      class="px"
      :prefix="'확인하고 싶은'"
      :suffix="'을 선택해주세요'"
    >
      <template #highlight>
        <div class="dropdown" ref="dropdownRoot">
          <button
            class="dropdown-btn"
            type="button"
            @click="toggle"
            aria-haspopup="listbox"
            :aria-expanded="open"
          >
            {{ currentLabel }} <span class="caret">▾</span>
          </button>
          <ul v-if="open" class="dropdown-list bodyMedium18px" role="listbox">
            <li role="option" @click="select('support')">지원금</li>
            <li role="option" @click="select('loan')">대출</li>
          </ul>
        </div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import TopMessage from './components/TopMessage.vue';
import { useFinancialStore } from '@/stores/financial';

const store = useFinancialStore();
const router = useRouter();

/* =========================
   API
========================= */
const API_BASE = 'http://localhost:3000';
const endpoints = {
  loan: `${API_BASE}/loan`,
  support: `${API_BASE}/support`,
};
const cache = {
  loan: null, // string[]  (상품명)
  support: null, // string[]  (service_name)
};

function pickTitle(mode, row) {
  return mode === 'loan' ? row['상품명'] : row['service_name'];
}

/* 전체 타이틀 1회 로드 + 캐시 */
async function loadTitles(mode) {
  if (!mode) return;
  if (cache[mode]) return; // 캐시 있으면 패스
  loading.value = true;
  try {
    // json-server: 많이 잡아와서 프론트에서 필터
    const res = await fetch(`${endpoints[mode]}?_limit=1000`);
    const data = await res.json();
    cache[mode] = data.map((r) => pickTitle(mode, r)).filter(Boolean);
  } catch (e) {
    console.error('타이틀 로드 실패:', e);
    cache[mode] = [];
  } finally {
    loading.value = false;
    // 최초 진입 시 추천 업데이트
    updateSuggestions();
  }
}

/* =========================
   드롭다운
========================= */
const open = ref(false);
const dropdownRoot = ref(null);
function toggle() {
  open.value = !open.value;
}
function select(mode) {
  store.setMode(mode);
  open.value = false;
}
function onClickOutside(e) {
  if (!dropdownRoot.value) return;
  if (!dropdownRoot.value.contains(e.target)) open.value = false;
}
function onKeyEsc(e) {
  if (e.key === 'Escape') open.value = false;
}
onMounted(() => {
  window.addEventListener('click', onClickOutside);
  window.addEventListener('keydown', onKeyEsc);
});
onBeforeUnmount(() => {
  window.removeEventListener('click', onClickOutside);
  window.removeEventListener('keydown', onKeyEsc);
});

/* =========================
   라벨/플레이스홀더
========================= */
const currentLabel = computed(() =>
  'modeLabel' in store && store.modeLabel
    ? store.modeLabel
    : store.mode === 'support'
    ? '지원금'
    : store.mode === 'loan'
    ? '대출'
    : '지원금'
);

const placeholder = computed(() => {
  if ('searchPlaceholder' in store && store.searchPlaceholder)
    return store.searchPlaceholder;
  if (!store.mode) return '지원금/대출을 먼저 선택하세요';
  return store.mode === 'support'
    ? '지원금을 검색해보세요'
    : '대출을 검색해보세요';
});

/* =========================
   검색/추천 상태
========================= */
const keyword = ref('');
const focused = ref(false);
const suggestions = ref([]);
const loading = ref(false);
let blurTimer = null;
let debounceTimer = null;

/* 추천 표시 조건: 포커스 + 모드 */
const showSuggest = computed(() => focused.value && !!store.mode);
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

/* 모드 바뀌면 데이터 로드 */
watch(
  () => store.mode,
  (m) => {
    keyword.value = '';
    suggestions.value = [];
    if (m) loadTitles(m);
  }
);

/* 입력 디바운스 → 프론트 필터 */
function onInput() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updateSuggestions, 80);
}

/* 추천 계산 (클라 필터) */
function updateSuggestions() {
  if (!store.mode) {
    suggestions.value = [];
    return;
  }
  const list = cache[store.mode] || [];
  const q = keyword.value.trim().toLowerCase();
  if (!q) {
    suggestions.value = list.slice(0, 5);
  } else {
    suggestions.value = list
      .filter((v) => v.toLowerCase().includes(q))
      .slice(0, 5);
  }
}

/* 추천 선택 시 즉시 검색 */
function selectSuggestion(item) {
  keyword.value = item;
  focused.value = false;
  doSearch();
}

/* doSearch → 입력 플로우 시작 */
function doSearch() {
  if (!store.mode) {
    alert('먼저 지원금/대출을 선택하세요!');
    return;
  }
  sessionStorage.setItem('financial-keyword', keyword.value.trim());
  if (store.mode === 'support') {
    router.push('/financial/support-basic');
  } else {
    router.push('/financial/loan-basic');
  }
}

/* 목록 보기 (선택) */
function goList() {
  router.push({
    path: '/financial/result',
    query: { mode: store.mode || 'support', list: '1' },
  });
}

/* 초기: 모드 있으면 타이틀 로드 */
onMounted(() => {
  if (store.mode) loadTitles(store.mode);
});
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

/* 드롭다운 */
.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.2;
  color: var(--color-primary);
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  padding-bottom: 2px;
  border-bottom: 2px solid currentColor;
}
.caret {
  font-weight: 700;
}
.dropdown-list {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 20;
  min-width: 7rem;
  background: #fff;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  padding: 0.25rem 0;
  list-style: none;
}
.dropdown-list li {
  padding: 0.625rem 1rem;
  cursor: pointer;
}
.dropdown-list li:hover {
  background: var(--color-primary-10);
}

/* 검색창 */
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
  padding: 0 3rem 0 1rem; /* 오른쪽 버튼 공간 */
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

/* 추천 리스트 */
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
  align-items: center; /* 아이콘+텍스트 수직 가운데 정렬 */
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  line-height: 1.5; /* 글자 높이 고정 */
}

.search-badge {
  width: 1.4rem;
  height: 1.4rem;
  min-width: 1.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px; /* 완전 둥글 */
  background: var(--color-primary); /* 파란 배경 */
  color: #fff; /* 아이콘 흰색 */
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
