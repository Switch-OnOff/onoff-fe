<!-- src/pages/financial/components/SelectField.vue -->
<template>
  <label class="field" :class="{ filled: !!label }" ref="root">
    <span class="placeholder">{{ placeholder }}</span>

    <button
      type="button"
      class="display"
      @click="toggle"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter.prevent="commit()"
      @keydown.esc.prevent="open = false"
      :aria-expanded="open"
      aria-haspopup="listbox"
    >
      <span class="text" :class="{ dim: !label }">{{
        label || placeholder
      }}</span>
      <span class="caret" :class="{ open }" aria-hidden="true"></span>
    </button>

    <ul
      v-if="open"
      ref="list"
      class="dropdown-list bodyMedium16px"
      :class="{ 'drop-up': dropUp }"
      role="listbox"
      :aria-label="placeholder"
      :style="{ maxHeight: maxListHeight + 'px' }"
    >
      <li
        v-for="(it, i) in items"
        :key="it.value"
        role="option"
        :aria-selected="cursor === i"
        class="option"
        :class="{ active: cursor === i }"
        @mousedown.prevent="select(i)"
      >
        {{ it.label }}
      </li>
    </ul>
  </label>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';

const props = defineProps({
  modelValue: [String, Number, null],
  items: { type: Array, default: () => [] }, // [{ label, value }]
  placeholder: { type: String, default: '' },
  maxListHeight: { type: Number, default: 260 }, // 스크롤 높이 제한
});
const emit = defineEmits(['update:modelValue']);

const open = ref(false);
const cursor = ref(-1);
const root = ref(null);
const list = ref(null);
const dropUp = ref(false);

const label = computed(() => {
  const f = props.items.find((i) => i.value === props.modelValue);
  return f ? f.label : '';
});

function toggle() {
  open.value = !open.value;
  if (open.value) afterOpen();
}

function afterOpen() {
  // 현재 값으로 커서 맞추기
  cursor.value = Math.max(
    0,
    props.items.findIndex((i) => i.value === props.modelValue)
  );

  // 화면 하단 공간 체크해서 drop-up 여부 결정
  nextTick(() => {
    if (!root.value) return;
    const r = root.value.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 12;
    dropUp.value = spaceBelow < props.maxListHeight;
    scrollActiveIntoView();
  });
}

function move(d) {
  if (!open.value) {
    open.value = true;
    afterOpen();
    return;
  }
  const n = props.items.length;
  cursor.value = ((cursor.value < 0 ? -1 : cursor.value) + d + n) % n;
  nextTick(scrollActiveIntoView);
}

function scrollActiveIntoView() {
  if (!list.value || cursor.value < 0) return;
  const el = list.value.children[cursor.value];
  if (el && el.scrollIntoView) {
    el.scrollIntoView({ block: 'nearest' });
  }
}

function commit() {
  if (cursor.value >= 0)
    emit('update:modelValue', props.items[cursor.value].value);
  open.value = false;
}

function select(i) {
  cursor.value = i;
  commit();
}

function onClickOutside(e) {
  if (!root.value) return;
  if (!root.value.contains(e.target)) open.value = false;
}
onMounted(() => window.addEventListener('click', onClickOutside));
onBeforeUnmount(() => window.removeEventListener('click', onClickOutside));

watch(
  () => props.modelValue,
  () => {
    /* label만 반응 */
  }
);
</script>

<style scoped>
.field {
  position: relative;
  display: flex;
  align-items: center;
  height: 56px;
  border-bottom: 1px solid #e6e6eb;
}
.placeholder {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #7a7a85;
  pointer-events: none;
  transition: 0.15s ease;
}
.field.filled .placeholder {
  opacity: 0;
}

/* 표시부 */
.display {
  width: 100%;
  height: 100%;
  background: transparent;
  border: 0;
  outline: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 28px;
  cursor: pointer;
}
.text {
  font-size: 16px;
  color: var(--color-black);
}
.text.dim {
  color: transparent;
}
.caret {
  position: absolute;
  right: 0;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  /* 회색 캐럿 (기본) */
  background-image: url("data:image/svg+xml;utf8,\<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%239EA2A8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  transition: transform 0.15s ease;
}

/* 열렸을 때 살짝 뒤집기 */
.caret.open {
  transform: rotate(180deg);
}

/* 포커스 들어오면 포인트만 살짝 진하게 (선택사항) */
.field:focus-within .caret {
  background-image: url("data:image/svg+xml;utf8,\<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%230E0B80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
}

/* 리스트 */
.dropdown-list {
  position: absolute;
  z-index: 30;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  background: #fff;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  padding: 0.25rem 0;
  list-style: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

  /* 스크롤링 설정 */
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
.dropdown-list.drop-up {
  top: auto;
  bottom: calc(100% + 8px);
}

.option {
  padding: 0.625rem 1rem;
  cursor: pointer;
  line-height: 1.5;
}
.option:hover,
.option.active {
  background: var(--color-primary-10);
}

.field:focus-within {
  border-bottom-color: var(--color-primary);
}
</style>
