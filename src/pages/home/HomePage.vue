<template>
  <main class="home">
    <header class="brand-bar">
      <div class="mode-row">
        <span class="mode-label bodyBold18px">
          {{ mode === 'TRANSFER' ? '양도/폐업자' : '승계/창업자' }}
        </span>
        <SegmentSwitch
          v-model="mode"
          left-text="양도"
          right-text="승계"
          size="md"
          :track-on="'var(--color-primary-10)'"
          :track-off="'var(--color-primary-10)'"
          :handle-bg="'var(--color-white)'"
          :text-color="'var(--color-black)'"
        />
      </div>
    </header>

    <!-- 자동 전환 카드뉴스 -->
    <section class="hero">
      <HeroCarousel :items="news" :h="190" />
    </section>

    <!-- 모드별 액션 타일 (164 × 164) -->
    <section class="nav-grid">
      <SquareNavButton
        v-for="a in actions"
        :key="a.label"
        :label="a.label"
        :to="a.to"
      />
    </section>

    <!-- 하단: 정책·대출 (모드 props로 전환) -->
    <section class="bottom">
      <PolicyBottom :mode="mode" />
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import SegmentSwitch from '@/pages/home/components/SegmentSwitch.vue'
import HeroCarousel from '@/pages/home/components/HeroCarousel.vue'
import SquareNavButton from '@/pages/home/components/SquareNavButton.vue'
import PolicyBottom from '@/pages/home/components/PolicyBottom.vue' // ← 통합 컴포넌트

const mode = ref('TRANSFER') // 'TRANSFER' | 'SUCCESSION'

// 카드뉴스 아이템(예시)
const news = ref([
  { title: '공지/앱 사용 가이드', text: '처음 사용자라면 여기부터!' },
  { title: '양도 전 체크리스트', text: '등록 전에 반드시 확인하세요.' },
  { title: '승계 추천 매물', text: '관심 매물 기반으로 추천해드려요.' },
])

// 모드에 따라 2개씩 노출 (요구 라벨 4개 재사용)
const actions = computed(() =>
  mode.value === 'TRANSFER'
    ? [
        { label: '등록 매물 관리', to: 'ManageListings' },
        { label: '양도 매물 등록', to: 'listing-new' },
      ]
    : [
        { label: '관심 매물 목록', to: 'Favorites' },
        { label: '매물 지도 이동', to: 'listing-map' },
      ]
)
</script>

<style scoped>
.home {
  display: flex; flex-direction: column;
  gap: 16px;
  padding: 1.5rem;
  background: var(--color-white);
}

/* 상단 */
.brand-bar { display:flex; flex-direction: column; gap: 12px; }
.mode-row { display:flex; align-items:center; justify-content: space-between; }
.mode-label { color: var(--color-lightblack); }

/* 카드뉴스 영역은 컴포넌트가 높이를 가짐 */
.hero { }

.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 164px);
  gap: 12px;
  justify-content: space-between; /* 좌우 균형 */
}

.bottom { margin-bottom: 12px; }
</style>
