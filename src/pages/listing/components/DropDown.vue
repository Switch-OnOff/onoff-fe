<!-- src/components/common/SelectField.vue -->
<template>
  <label class="field" :class="{ filled: !!label }" ref="root">
    <span class="placeholder bodyMedium16px">{{ placeholder }}</span>

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
      <span class="text bodyMedium16px" :class="{ dim: !label }">
        {{ label || placeholder }}
      </span>
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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  modelValue: [String, Number, null],
  items: { type: Array, default: () => [] }, // [{ label, value }]
  placeholder: { type: String, default: '' },
  maxListHeight: { type: Number, default: 260 },
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
  cursor.value = Math.max(
    0,
    props.items.findIndex((i) => i.value === props.modelValue)
  );
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
  if (el?.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
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

watch(() => props.modelValue, () => {});
</script>

<style scoped>
/* ===== 인풋 박스 룩(공통 인풋과 통일) ===== */
.field {
  position: relative;
  display: block;
  width: 100%;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: var(--color-white);
  box-sizing: border-box;
}

/* 포커스 시 테두리 컬러만 변경 */
.field:focus-within {
  border-color: var(--color-primary);
}

/* placeholder (입력 내부 왼쪽 정렬) */
.placeholder {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-mediumgray);
  pointer-events: none;
  transition: opacity .15s ease;
}
.field.filled .placeholder { opacity: 0; }

/* 표시부 버튼을 인풋처럼 */
.display {
  width: 100%;
  height: 50px;                 /* 높이 통일 */
  padding: 0 40px 0 16px;       /* 좌 16, 우 캐럿 공간 */
  background: transparent;
  border: 0;
  outline: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
}

/* 내용 텍스트 */
.text {
  color: var(--color-black);
}
.text.dim {
  color: transparent; /* placeholder가 대신 보이도록 */
}

/* 캐럿 아이콘 */
.caret {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  transition: transform .15s ease;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%239EA2A8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
}
.caret.open { transform: translateY(-50%) rotate(180deg); }
.field:focus-within .caret {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%230E0B80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
}

/* 드롭다운 */
.dropdown-list {
  position: absolute;
  z-index: 30;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  background: #fff;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  padding: 4px 0;
  list-style: none;
  overflow-y: auto;
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
}
.dropdown-list.drop-up {
  top: auto;
  bottom: calc(100% + 8px);
}

/* 옵션: hover 제거, active만 표시 */
.option {
  padding: 10px 14px;
  line-height: 1.5;
  cursor: pointer;
  outline: none;
  user-select: none;
}
.option.active {
  background: var(--color-primary-10);
}
</style>
