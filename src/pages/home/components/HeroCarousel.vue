<template>
  <div class="hero" :style="{ height: h + 'px' }">
    <div class="slide"
         v-for="(it, i) in items"
         :key="i"
         :class="{ active: i === idx }">
      <div class="content">
        <h3 class="titleExtra20px" v-if="it.title">{{ it.title }}</h3>
        <p class="bodyRegular14px" v-if="it.text">{{ it.text }}</p>
      </div>
    </div>

    <div class="dots" v-if="items.length > 1">
      <span v-for="(it, i) in items" :key="'dot'+i"
            class="dot" :class="{ on: i === idx }"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  items: { // {title?:string, text?:string}[]
    type: Array,
    default: () => ([
      { title: '공지/앱 사용 가이드', text: '카드 뉴스 형식으로 안내합니다.' },
      { title: '점포 양도 체크리스트', text: '양도 전 필수 확인 항목 보러가기' },
      { title: '승계 추천', text: '관심 매물 기반으로 추천을 받아보세요.' },
    ]),
  },
  h: { type: Number, default: 180 }, // 높이 더 줌(기존 140 → 180)
  intervalMs: { type: Number, default: 3000 },
})

const idx = ref(0)
let timer

onMounted(() => {
  if (props.items.length <= 1) return
  timer = setInterval(() => {
    idx.value = (idx.value + 1) % props.items.length
  }, props.intervalMs)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: #e9e9e9;
}
.slide {
  position: absolute; inset: 0;
  opacity: 0; transform: translateX(10px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  color: var(--color-lightblack);
  transition: opacity .35s ease, transform .35s ease;
}
.slide.active { opacity: 1; transform: translateX(0); }

.content { text-align: center; display: grid; gap: 8px; }

.dots {
  position: absolute; right: 10px; bottom: 8px;
  display: flex; gap: 6px; align-items: center;
}
.dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(0,0,0,.25);
}
.dot.on { background: rgba(0,0,0,.6); }
</style>
