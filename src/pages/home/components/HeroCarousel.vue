<!-- BannerHero.vue -->
<template>
  <div class="hero" :style="{ height: h + 'px' }"
       @mouseenter="pause" @mouseleave="play">
    <div
      class="slide"
      v-for="(src, i) in normalized"
      :key="src + '_' + i"
      :class="{ active: i === idx }"
    >
      <img :src="src" alt="홈 배너" class="banner-img" loading="lazy" />
    </div>

    <div class="dots" v-if="normalized.length > 1">
      <span
        v-for="(_, i) in normalized"
        :key="'dot' + i"
        class="dot"
        :class="{ on: i === idx }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
  /**
   * items: 이미지 경로 배열 (페이지에서 import 해서 넘겨줘)
   * 예) [b1, b2, b3] 또는 ['/images/a.jpg', '/images/b.jpg']
   */
  items: { type: Array, default: () => [] },
  h: { type: Number, default: 180 },
  intervalMs: { type: Number, default: 3000 },
  autoplay: { type: Boolean, default: true },
})

const idx = ref(0)
let timer = null

// 문자열/객체 대응(문자열만 쓰면 그대로 사용)
const normalized = computed(() =>
  props.items
    .map(it => (typeof it === 'string' ? it : it?.src))
    .filter(Boolean)
)

function play() {
  if (!props.autoplay) return
  if (timer || normalized.value.length <= 1) return
  timer = setInterval(() => {
    idx.value = (idx.value + 1) % normalized.value.length
  }, props.intervalMs)
}
function pause() {
  if (!timer) return
  clearInterval(timer)
  timer = null
}

onMounted(play)
onBeforeUnmount(pause)
</script>

<style scoped>
.hero {
  position: relative; width: 100%;
  overflow: hidden; border-radius: 12px;
  background: #e9e9e9;
}
.slide {
  position: absolute; inset: 0;
  opacity: 0; transform: translateX(10px);
  transition: opacity .35s ease, transform .35s ease;
}
.slide.active { opacity: 1; transform: translateX(0); }

.banner-img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}

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
