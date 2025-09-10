<template>
  <div class="industry">
    <select class="select-box bodyMedium16px" v-model="majorLocal">
      <option value="">대분류 선택</option>
      <option v-for="c in categories" :key="c.major" :value="c.major">
        {{ c.major }}
      </option>
    </select>

    <select
      class="select-box bodyMedium16px"
      v-model="minorLocal"
      :disabled="!majorLocal"
    >
      <option value="">중분류 선택</option>
      <option v-for="m in minorList" :key="m" :value="m">
        {{ m }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  major: String,
  minor: String
})
const emit = defineEmits(['update:major', 'update:minor'])

const majorLocal = ref(props.major || '')
const minorLocal = ref(props.minor || '')

/* v-model 양방향 바인딩 */
watch(majorLocal, (v) => {
  emit('update:major', v)
  if (!v) minorLocal.value = '' // 대분류 비우면 중분류도 초기화
})
watch(minorLocal, (v) => emit('update:minor', v))

/* 부모가 props를 바꿨을 때도 로컬 반영 */
watch(
  () => props.major,
  (v) => {
    if (v !== majorLocal.value) majorLocal.value = v || ''
    if (!v) minorLocal.value = ''
  }
)
watch(
  () => props.minor,
  (v) => {
    if (v !== minorLocal.value) minorLocal.value = v || ''
  }
)

const minorList = computed(() => {
  const f = props.categories.find((c) => c.major === majorLocal.value)
  return f ? f.minors : []
})
</script>

<style scoped>
.industry {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* InputSimple.vue 스타일 반영 + 화살표 여유 공간 확보 */
.select-box {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: 1px solid var(--color-lightgray);
  padding: 0 8px;
  padding-right: 36px; 
  box-sizing: border-box;
  background: var(--color-white);
  transition: border 0.2s;
  font: inherit;
}

.select-box:focus {
  border-color: var(--color-primary);
  outline: none;
}

/* 비활성화 상태 가독성 */
.select-box:disabled {
  background-color: #f7f7f7;
  color: var(--color-mediumgray);
  cursor: not-allowed;
}
</style>
