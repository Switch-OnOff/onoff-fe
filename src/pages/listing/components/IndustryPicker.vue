<template>
  <div class="industry">
    <!-- 대분류 -->
    <SelectField
      v-model="majorLocal"
      :items="majorItems"
      placeholder="대분류 선택"
    />

    <SelectField
      v-model="minorLocal"
      :items="minorItems"
      placeholder="중분류 선택"
      :class="{ disabled: !majorLocal }"
    />
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import SelectField from '@/pages/listing/components/DropDown.vue'

const props = defineProps({
  categories: { type: Array, default: () => [] }, 
  major: String,
  minor: String
})

const emit = defineEmits(['update:major', 'update:minor'])

const majorLocal = ref(props.major || '')
const minorLocal = ref(props.minor || '')

/* 드롭다운용 아이템 생성 */
const majorItems = computed(() =>
  (props.categories || []).map(c => ({ label: c.major, value: c.major }))
)
const minorItems = computed(() => {
  const f = (props.categories || []).find(c => c.major === majorLocal.value)
  return (f?.minors || []).map(m => ({ label: m, value: m }))
})

/* v-model 양방향 바인딩 */
watch(majorLocal, (v) => {
  emit('update:major', v)
  if (!v) minorLocal.value = ''      // 대분류 비우면 중분류 초기화
})
watch(minorLocal, (v) => emit('update:minor', v))

/* 부모에서 props 변경 시 로컬 반영 */
watch(() => props.major, (v) => {
  if (v !== majorLocal.value) majorLocal.value = v || ''
  if (!v) minorLocal.value = ''
})
watch(() => props.minor, (v) => {
  if (v !== minorLocal.value) minorLocal.value = v || ''
})
</script>

<style scoped>
.industry {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* 중분류 비활성(대분류 미선택 시) */
.disabled {
  opacity: .6;
  pointer-events: none;   /* 클릭/열림 방지 */
  cursor: not-allowed;
}
</style>
