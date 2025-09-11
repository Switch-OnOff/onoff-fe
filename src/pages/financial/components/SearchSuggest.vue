<!-- src/pages/financial/components/SearchSuggest.vue -->
<template>
  <div class="search">
    <div class="search-wrap">
      <input
        type="text"
        class="search-input"
        :class="hasFilter ? 'with-filter' : 'no-filter'"
        :value="modelValue"
        :placeholder="placeholder"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keyup.enter="onSubmit"
        inputmode="search"
        aria-autocomplete="list"
        :aria-expanded="open && showDropdown"
        :aria-controls="open && showDropdown ? 'suggest-list' : undefined"
      />

      <!-- 돋보기 -->
      <button
        class="icon-btn search-btn"
        :class="hasFilter ? 'with-filter' : 'no-filter'"
        type="button"
        @click="onSubmit"
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

      <!-- 필터 -->
      <button
        v-if="hasFilter"
        class="icon-btn filter-btn"
        :class="{ filled: filterActive }"
        type="button"
        @click="$emit('filter')"
        aria-label="필터"
      >
        <svg
          class="funnel"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M3 5h18l-6.8 7.3v5.2c0 .4-.2.8-.6 1l-2.8 1.6c-.6.3-1.3-.1-1.3-.8v-7L3 5z"
          />
        </svg>
      </button>

      <!-- 추천 -->
      <ul
        v-if="open && showDropdown"
        id="suggest-list"
        class="suggestion-list"
        role="listbox"
      >
        <li
          v-for="(item, i) in list"
          :key="i"
          class="bodyMedium16px"
          role="option"
          @mousedown.prevent="select(item)"
        >
          <span class="search-badge" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <!-- __query 항목이면 '내 검색어' 그대로 표시 -->
          <template v-if="item && item.__query">{{ item.__query }}</template>
          <template v-else>{{ displayLabel(item) }}</template>
        </li>

        <li v-if="loading" class="bodyLight12px" style="padding: 0.5rem 1rem">
          불러오는 중…
        </li>
        <li
          v-else-if="touched && list.length === 0"
          class="bodyLight12px"
          style="padding: 0.5rem 1rem"
        >
          결과 없음
        </li>
      </ul>
    </div>
    <slot name="below"></slot>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  getSuggestions: { type: Function, required: true }, // (q) => Promise<Array>
  max: { type: Number, default: 12 }, // 입력 있을 때 최대
  initialMax: { type: Number, default: 5 }, // 입력 없을 때 최대(Top 5)
  showDropdown: { type: Boolean, default: true },
  hasFilter: { type: Boolean, default: false }, // 깔때기 표시 여부
  filterActive: { type: Boolean, default: false }, // 깔때기 강조 상태
  labelKey: { type: String, default: '' }, // 예: 'service_name' / '상품명'
  valueKey: { type: String, default: '' }, // 예: 'service_id' / '상품ID'
  emitOnEnter: { type: Boolean, default: true },
  emitOnSelect: { type: Boolean, default: true },
});
const emit = defineEmits(['update:modelValue', 'submit', 'select', 'filter']);

const open = ref(false);
const list = ref([]);
const loading = ref(false);
const touched = ref(false);

let blurTimer = null;
let debounceTimer = null;

/** 값(id) 추출 (valueKey 우선, 없으면 후보들에서 탐색) */
function extractValue(item) {
  if (item == null || typeof item !== 'object') return undefined;
  const candidates = [
    props.valueKey, // 부모가 준 기본 키 (예: 'service_id' or '상품ID')
    'serviceId',
    'service_id',
    'loanId',
    'loan_id',
    '상품ID',
    'id',
  ].filter(Boolean);
  for (const k of candidates) {
    if (item[k] != null && item[k] !== '') return item[k];
  }
  return undefined;
}

/** valueKey가 비어있는 아이템이면, 추출값을 해당 키로 주입해서 반환 */
function normalizeItem(item) {
  if (item == null || typeof item !== 'object') return item;
  const v = extractValue(item);
  if (v === undefined) return item;
  // 이미 props.valueKey가 없거나 비어있으면 그대로 둠 (부모가 빈 값 넘기면 'id'에 넣어도 됨)
  const key = props.valueKey || 'id';
  if (item[key] !== v) {
    return { ...item, [key]: v };
  }
  return item;
}

/** 라벨 뽑기(폴백 포함) */
const displayLabel = (item) => {
  if (item == null) return '';
  if (typeof item !== 'object') return String(item);
  const candidates = [
    props.labelKey,
    'label',
    'title',
    'name',
    'service_name',
    '상품명',
    'summary',
    '요약',
  ].filter(Boolean);
  for (const k of candidates) {
    if (item[k] != null && item[k] !== '') return String(item[k]);
  }
  return String(
    item.id ?? item[props.valueKey] ?? item.service_id ?? item['상품ID'] ?? ''
  );
};

function onInput(e) {
  emit('update:modelValue', e.target.value);
  scheduleSuggest();
}
function onFocus() {
  open.value = true;
  scheduleSuggest(0);
}
function onBlur() {
  clearTimeout(blurTimer);
  blurTimer = setTimeout(() => (open.value = false), 100);
}

function onSubmit() {
  open.value = false;
  if (!props.emitOnEnter) return;
  const q = (props.modelValue || '').trim();
  const found = list.value.find((it) => !it?.__query && displayLabel(it) === q);
  emit('submit', found || q); // 객체 or 문자열
}

function select(item) {
  if (item && item.__query) {
    const q = item.__query.trim();
    emit('update:modelValue', q);
    open.value = false;
    if (!props.emitOnSelect) return;
    emit('submit', q);
    return;
  }
  const fixed = normalizeItem(item);
  const label = displayLabel(fixed);
  emit('update:modelValue', label);
  emit('select', fixed);
  open.value = false;
  emit('submit', fixed);
}

function scheduleSuggest(delay = 120) {
  if (!props.showDropdown) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(load, delay);
}

async function load() {
  if (!open.value || !props.showDropdown) return;
  loading.value = true;
  try {
    const q = (props.modelValue || '').trim();
    const res = await props.getSuggestions(q);
    const rawArr = Array.isArray(res) ? res : [];
    const arr = rawArr.map(normalizeItem);

    // 중복 라벨 제거 + 개수 제한(입력 유무에 따라)
    const seen = new Set();
    const dedup = [];
    const limit = q ? props.max : props.initialMax;
    for (const it of arr) {
      const label = displayLabel(it);
      if (!label || seen.has(label)) continue;
      seen.add(label);
      dedup.push(it);
      if (dedup.length >= limit) break;
    }

    // 입력이 있을 때는 맨 위에 "내 검색어" 가짜 항목 추가
    list.value = q ? [{ __query: q }, ...dedup] : dedup;
    touched.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => scheduleSuggest(0));
watch(
  () => props.modelValue,
  () => scheduleSuggest()
);
</script>

<style scoped>
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
  border: 2px solid var(--color-primary);
  border-radius: 12px;
  background: #fff;
  outline: none;
  font-size: 1rem;
  padding-left: 1rem;
}
/* 오른쪽 패딩: 필터 유무에 따라 자동 조정 */
.search-input.no-filter {
  padding-right: 3rem;
}
.search-input.with-filter {
  padding-right: 5.5rem;
}

/* 공통 아이콘 버튼 */
.icon-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
/* 돋보기 위치 */
.search-btn.no-filter {
  right: 0.5rem;
}
.search-btn.with-filter {
  right: 2.25rem;
}

/* 필터 아이콘: 항상 보이되, 활성시 강조 점 */
.filter-btn {
  right: 0.5rem;

  background: #fff;
  color: var(--color-primary);
}

/* 기본: 비어있는(Outline) 깔때기 */
.filter-btn .funnel path {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

/* filled 상태: 꽉 찬 깔때기 */
.filter-btn.filled .funnel path {
  fill: currentColor;
  stroke: currentColor; /* 둘 다 넣어주면 테두리도 또렷 */
}
/* 드롭다운 */
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
</style>
