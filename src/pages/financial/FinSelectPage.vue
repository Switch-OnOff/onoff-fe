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
      :label-key="labelKey"
      :value-key="valueKey"
      :initial-max="5"
      :max="12"
      @submit="onIntroSubmit"
      @select="onIntroSelect"
    />

    <div class="list-link bodyLight12px" @click="goList">
      대출·지원금 목록 보기
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import TopMessage from './components/TopMessage.vue';
import SearchSuggest from './components/SearchSuggest.vue';
import SelectField from '../../components/common/SelectField.vue';
import { useFinancialStore } from '@/stores/financial';
import * as grants from '@/api/grants';
import * as loans from '@/api/loan';

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

// 검색창 placeholder
const placeholder = computed(() =>
  store.mode === 'loan'
    ? '대출을 검색해보세요'
    : store.mode === 'support'
    ? '지원금을 검색해보세요'
    : '종류를 먼저 선택하세요'
);

// 기본 모드 보정
onMounted(() => {
  if (!store.mode) store.setMode('support');
});

// SearchSuggest에 labelKey, valueKey 전달 (백엔드 필드 기준)
const labelKey = computed(() =>
  store.mode === 'loan' ? 'loanName' : 'serviceName'
);
const valueKey = computed(() =>
  store.mode === 'loan' ? 'loanId' : 'serviceId'
);
function onIntroSubmit(payload) {
  if (!payload || typeof payload !== 'object') return;
  onIntroSelect(payload);
}

function onIntroSelect(row) {
  const id = row?.[valueKey.value];
  if (!id) return;

  if (store.mode === 'support') {
    router.push({ path: '/financial/support-basic', query: { id } });
  } else if (store.mode === 'loan') {
    router.push({ path: '/financial/loan-basic', query: { id } });
  }
}

// row 전체 반환 (백엔드 API 사용)
async function getSuggestions(q) {
  if (!store.mode) return [];
  try {
    if (store.mode === 'loan') {
      if (!q) {
        const top = await loans.getTop5Loans();
        return Array.isArray(top) ? top : [];
      }
      const arr = await loans.searchLoans(q || '');
      return Array.isArray(arr) ? arr : [];
    }
    if (!q) {
      const top = await grants.getTop5Grants();
      return Array.isArray(top) ? top : [];
    }
    const arr = await grants.searchGrants(q || '');
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('[FinSelect] suggestions failed:', e);
    return [];
  }
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
