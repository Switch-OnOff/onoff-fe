<template>
  <div class="search-wrap">
    <form class="search-bar" @submit.prevent="submit">
      <input
        ref="inputEl"
        v-model.trim="q"
        type="search"
        class="input bodyMedium14px"
        :placeholder="placeholder"
        @keydown.esc="clear"
      />
      <button
        v-if="q.length"
        class="clear"
        type="button"
        aria-label="검색어 지우기"
        @click="clear"
      >×</button>

      <!-- 오른쪽 아이콘 버튼 (submit) -->
      <button class="icon-btn" type="submit" aria-label="검색">
        <img class="icon" :src="searchIcon" alt="" aria-hidden="true" />
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import searchIcon from '@/assets/icons/search.png'

const props = defineProps({
  placeholder: { type: String, default: '지역·주소·장소·역명 등을 검색하세요' },
  autoFocus: { type: Boolean, default: false },
})
const emit = defineEmits(['search','clear'])

const q = ref('')
const inputEl = ref(null)

function submit() {
  if (!q.value) return
  emit('search', q.value)
}
function clear() {
  q.value = ''
  emit('clear')
  inputEl.value?.focus()
}

onMounted(() => { if (props.autoFocus) inputEl.value?.focus() })
</script>

<style scoped>
.search-wrap{
  position: absolute; left: 12px; right: 12px; top: 10px;
  z-index: 10001;
}
.search-bar{
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 6px;
  padding: 0;                
  background: var(--color-white);   
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  box-shadow: none;          
  height: 45px;          
  padding-left: 12px;       
  padding-right: 6px;
}

.input{
  border: 0; outline: 0; background: transparent; min-width: 0;
  color: var(--color-lightblack);
  height: 100%;
}

.clear{
  border: 0; background: transparent; width: 28px; height: 28px;
  border-radius: 50%; cursor: pointer; color: var(--color-mediumgray);
}

/* 오른쪽 아이콘(눌러서 검색 가능) */
.icon-btn{
  display: inline-grid; place-items: center;
  width: 32px; height: 32px; border-radius: 8px;
  border: 0; background: transparent; cursor: pointer;
}
.icon{ width: 18px; height: 18px; opacity: .9; display: block; }
</style>
