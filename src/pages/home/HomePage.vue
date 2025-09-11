<!-- HomePage.vue (수정본) -->
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

    <!-- 배너: 이미지 3장 자동 전환 -->
    <section class="hero">
      <BannerHero :items="banners" :h="190" :intervalMs="3000" />
    </section>

    <!-- 모드별 액션 타일 (164 × 164) -->
    <section class="nav-grid">
      <SquareNavButton
        v-for="a in actions"
        :key="a.label"
        :label="a.label"
        :to="a.to"
      >
        <template #icon>
          <img :src="a.icon" alt="" />
        </template>
      </SquareNavButton>
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
import BannerHero from '@/pages/home/components/HeroCarousel.vue'
import SquareNavButton from '@/pages/home/components/SquareNavButton.vue'
import PolicyBottom from '@/pages/home/components/PolicyBottom.vue' 

import icManage from '@/assets/icons/manage.png';
import icAdd from '@/assets/icons/add.png';
import icBookmark from '@/assets/icons/main-bookmark.png';
import icMap from '@/assets/icons/search-map.png';

import b1 from '@/assets/images/home-banner1.png'
import b2 from '@/assets/images/home-banner2.png'
import b3 from '@/assets/images/home-banner3.png'

const mode = ref('TRANSFER') // 'TRANSFER' | 'SUCCESSION'

// 배너 이미지 배열
const banners = [b1, b2, b3]

// 모드에 따라 2개씩 노출 (아이콘 포함)
const actions = computed(() =>
  mode.value === 'TRANSFER'
    ? [
        { label: '양도 매물 등록', to: 'listing-new', icon: icAdd },
        { label: '등록 매물 관리', to: 'my-listing', icon: icManage },
        { label: '양도 매물 등록', to: 'listing-new', icon: icAdd },
      ]
    : [
        { label: '관심 매물 목록', to: 'my-bookmark', icon: icBookmark },
        { label: '매물 지도 이동', to: 'listing-map', icon: icMap },
      ]
);
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 1.5rem;
  background: var(--color-white);
}

/* 상단 */
.brand-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mode-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mode-label {
  color: var(--color-lightblack);
}


.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 164px);
  gap: 12px;
  justify-content: space-between;
}

.bottom {
  margin-bottom: 12px;
}
</style>
