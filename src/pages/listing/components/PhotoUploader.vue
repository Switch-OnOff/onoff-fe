<template>
  <div class="pu">
    <div class="pu-head">
      <span class="count bodyMedium12px">{{ files.length }}/{{ max }}</span>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      :multiple="multiple"
      :capture="capture ? 'environment' : undefined"
      @change="onFiles"
      style="display:none"
    />

    <div class="pu-grid">
      <!-- 항상 표시. 꽉 차면 alert 후 열리지 않도록 제어 -->
      <div
        class="thumb add"
        :class="{ disabled: files.length >= max }"
        role="button"
        aria-label="사진 추가"
        @click.prevent="onAddClick"
      >
        <span class="plus" aria-hidden="true">＋</span>
      </div>

      <div v-for="(url, i) in previews" :key="i" class="thumb">
        <img :src="url" alt="" />
        <button
          type="button"
          class="del-btn bodyMedium14px"
          @click="remove(i)"
          aria-label="삭제"
        >✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }, // File[]
  max: { type: Number, default: 5 },
  min: { type: Number, default: 1 },
  multiple: { type: Boolean, default: true },
  capture: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const files = ref([...props.modelValue])
const previews = ref([])
const fileInput = ref(null)

/* 외부 변경 → 동기화 */
watch(
  () => props.modelValue,
  (nv) => {
    files.value = [...nv]
    rebuildPreviews()
  },
  { immediate: true }
)

/* 추가 버튼 클릭 핸들 */
function onAddClick() {
  if (files.value.length >= props.max) {
    alert('더이상 등록할 수 없습니다.')
    return
  }
  fileInput.value?.click()
}

/* 파일 선택 */
function onFiles(e) {
  const selected = Array.from(e.target.files || [])
  if (!selected.length) return

  const room = props.max - files.value.length
  if (room <= 0) {
    alert('더이상 등록할 수 없습니다.')
    e.target.value = ''
    return
  }

  if (selected.length > room) {
    alert(`최대 ${props.max}장까지 등록할 수 있습니다.`)
  }

  const slice = selected.slice(0, room)
  files.value = [...files.value, ...slice]
  emit('update:modelValue', files.value)
  rebuildPreviews()
  e.target.value = ''
}

/* 삭제 */
function remove(i) {
  const url = previews.value[i]
  files.value.splice(i, 1)
  previews.value.splice(i, 1)
  if (url) URL.revokeObjectURL(url)
  emit('update:modelValue', files.value)
}

/* 미리보기 갱신 */
function rebuildPreviews() {
  previews.value.forEach((u) => URL.revokeObjectURL(u))
  previews.value = files.value.map((f) => URL.createObjectURL(f))
}

onBeforeUnmount(() => {
  previews.value.forEach((u) => URL.revokeObjectURL(u))
})
</script>

<style scoped>
.pu-head{
  display: flex;
  justify-content: flex-end; /* 우측 정렬 */
  align-items: center;
  margin: 6px 0 8px;
  color: var(--color-mediumgray);
}
.pu-head .count { color: var(--color-primary); }

.pu-grid{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 6px;
}
@media (min-width: 420px){
  .pu-grid{ grid-template-columns: repeat(4, 1fr); }
}

.thumb{
  position: relative;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--color-lightgray);
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-lightgray);
}

.thumb.add{
  display: grid;
  place-items: center;
  cursor: pointer;
  border-style: dashed;
  background: #fafafa;
}
.thumb.add .plus{
  font-size: 32px;          /* 더 크게 */
  line-height: 1;
  color: var(--color-primary);
  font-weight: 600;
}
.thumb.add.disabled{
  opacity: .5;
  cursor: not-allowed;
}

.thumb img{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.del-btn{
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: rgba(0,0,0,.55);
  color: #fff;
  cursor: pointer;
  line-height: 24px;
}
.del-btn:active { transform: scale(0.98); }
</style>
