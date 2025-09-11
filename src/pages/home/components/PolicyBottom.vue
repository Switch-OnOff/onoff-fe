<template>
  <section class="bottom-wrap">
    <!-- 타이틀 + 점 인디케이터 한 줄 -->
    <div class="section-bar">
      <div class="title-wrap">
        <svg class="check-icon" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 10l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3 class="bodySemiBold16px">
          {{ isTransfer ? '폐업자를 위한 추천 대출·지원금' : '창업자를 위한 추천 대출·지원금' }}
        </h3>
      </div>
      <div class="dots" v-if="pages.length > 1">
        <span v-for="(_, i) in pages" :key="'dot'+i" class="dot" :class="{ on: i === pageIdx }"></span>
      </div>
    </div>

    <!-- 가로 스크롤: 한 페이지 = 2개(세트) -->
    <div class="scroller" ref="scroller" @scroll.passive="onScroll">
      <div class="page" v-for="(pg, i) in pages" :key="i">
        <article class="program" v-for="p in pg" :key="p.id">
          <div class="row-top">
            <span class="name bodyBold16px">{{ p.name }}</span>
            <span class="chip" :data-type="p.type">{{ p.type }}</span>
          </div>
          <p class="desc bodyRegular14px">{{ p.desc }}</p>
          <div class="row-bottom">
            <span class="meta bodyMedium12px">{{ p.region }} · 신청 {{ p.period }}</span>
            <button class="ghost-btn bodyMedium12px" type="button" @click="goDetail(p.id)">자세히</button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  /** 'TRANSFER' | 'SUCCESSION' */
  mode: { type: String, default: 'TRANSFER' },
})

const isTransfer = computed(() => props.mode === 'TRANSFER')
const router = useRouter()

// ✅ 목데이터: 모드별 분기
const programsTransfer = [
  { id: 1, name: '영세소상공인 폐업재도전 특별보증', type: '대출',   region: '전국',   period: '상시',   desc: '폐업(예정) 점포 임차보증금·대환 등 보증 지원.' },
  { id: 2, name: '지자체 폐업점포 정리 지원',       type: '지원금', region: '서울·경기', period: '분기별', desc: '원상복구·철거 비용 일부 보전(지자체 공고 참고).' },
  { id: 3, name: '재창업 컨설팅 바우처',           type: '컨설팅', region: '전국',   period: '선착순', desc: '폐업 신고 사업자 대상 재창업 컨설팅·교육 바우처.' },
  { id: 4, name: '소상공인 긴급경영안정자금',       type: '대출',   region: '전국',   period: '수시',   desc: '운영자금·대환용 저리자금(폐업/예정 특례 트랙).' },
]
const programsSuccession = [
  { id: 11, name: '소상공인 창업기반자금',     type: '대출',   region: '전국',   period: '상시',   desc: '창업 초기 운영·시설자금 저리 융자 지원.' },
  { id: 12, name: '예비창업 패키지 바우처',     type: '지원금', region: '전국',   period: '공고별', desc: '사업화 자금 일부 및 멘토링·교육 제공.' },
  { id: 13, name: '점포 임차보증금 이차보전',   type: '지원금', region: '지자체', period: '수시',   desc: '상가 임차보증금 이자 일부 보전(지자체별 상이).' },
  { id: 14, name: '청년창업 특별보증',         type: '대출',   region: '전국',   period: '상시',   desc: '만 39세 이하 예비·초기 창업자 특례 보증.' },
]

const items = computed(() => (isTransfer.value ? programsTransfer : programsSuccession))

// 2개씩 페이지 구성
const pages = computed(() => {
  const arr = items.value.slice()
  const out = []
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2))
  return out
})

const pageIdx = ref(0)
const scroller = ref(null)
function onScroll() {
  const el = scroller.value
  if (!el) return
  const i = Math.round(el.scrollLeft / el.clientWidth)
  pageIdx.value = Math.min(Math.max(i, 0), pages.value.length - 1)
}

function goDetail(id) {
  router.push({ name: 'support-detail', params: { id } }).catch(() => {})
}

onMounted(() => { pageIdx.value = 0 })
</script>

<style scoped>
.bottom-wrap { margin-top: 4px; }

/* 타이틀 + 점 한 줄 */
.section-bar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; margin: 0 2px 8px;
}
.title-wrap {
  display: inline-flex; align-items: center; gap: 4px; /* 아이콘-텍스트 간격 타이트 */
  color: var(--color-primary);
}
.check-icon { width: 16px; height: 16px; }

/* 점 인디케이터 */
.dots { display: flex; gap: 6px; align-items: center; padding-right: 6px; }
.dot  { width: 6px; height: 6px; border-radius: 50%; background: rgba(0,0,0,.25); }
.dot.on { background: rgba(0,0,0,.6); }

/* 가로 스냅(세트) */
.scroller {
  display: grid; grid-auto-flow: column; grid-auto-columns: 100%;
  overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
  gap: 12px; padding: 0 2px;
}
.page {
  scroll-snap-align: start;
  background: var(--color-white);
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,.04);
  display: grid; gap: 0; overflow: hidden;
}

/* 카드(컴팩트) */
.program { padding: 10px 12px; background: var(--color-white); }
.program + .program { border-top: 1px solid var(--color-lightgray); }
.row-top { display:flex; align-items:center; gap:6px; margin-bottom:4px; line-height:1.2; }
.name { color: var(--color-lightblack); }
.chip { padding: 1px 6px; border-radius: 9999px; font-size: 11px; line-height:1.2;
  background: var(--color-primary-10); color: var(--color-lightblack); }
.chip[data-type="지원금"] { background: #e9f2ff; }
.desc { color: var(--color-lightblack); line-height:1.3; margin:2px 0 6px;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.row-bottom { display:flex; align-items:center; justify-content:space-between; line-height:1.2; }
.meta { color: var(--color-darkgray); }
.ghost-btn { background: transparent; border: 1px solid var(--color-lightgray);
  padding: 4px 8px; border-radius: 8px; color: var(--color-lightblack); transition: var(--transition); }
.ghost-btn:active { transform: scale(.98); }
</style>
