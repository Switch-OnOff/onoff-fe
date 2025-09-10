<template>
  <div class="search">
    <div class="search-wrap">
      <input
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keyup.enter="onSubmit"
        class="search-input"
        inputmode="search"
        aria-autocomplete="list"
        :aria-expanded="open"
      />

      <button
        class="icon-btn"
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

      <!-- 추천 리스트 -->
      <ul v-if="open" class="suggestion-list" role="listbox">
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
          {{ item }}
        </li>
        <li v-if="loading" class="bodyLight12px" style="padding: 0.5rem 1rem">
          불러오는 중…
        </li>
        <li
          v-else-if="list.length === 0"
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
  // 모드에 따라 부모가 주입: (q:string) => Promise<string[]>
  getSuggestions: { type: Function, required: true },
  max: { type: Number, default: 5 },
});

const emit = defineEmits(['update:modelValue', 'submit', 'select']);

const open = ref(false);
const list = ref([]);
const loading = ref(false);
let blurTimer = null;
let debounceTimer = null;

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
  blurTimer = setTimeout(() => (open.value = false), 80);
}
function onSubmit() {
  open.value = false;
  emit('submit', props.modelValue.trim());
}
function select(item) {
  emit('update:modelValue', item);
  emit('select', item);
  open.value = false;
  emit('submit', item);
}

function scheduleSuggest(delay = 80) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(load, delay);
}
async function load() {
  if (!open.value) return;
  loading.value = true;
  try {
    const res = await props.getSuggestions(props.modelValue.trim());
    list.value = (Array.isArray(res) ? res : []).slice(0, props.max);
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
</style>
