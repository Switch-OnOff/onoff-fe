<!-- src/pages/listing/ListingsPage.vue -->
<template>
  <div class="listings-wrap">
    <SimpleHeader title="매물 리스트">
      <template #action>
        <button class="bookmark-btn" @click="goBookmarks" aria-label="북마크로 이동">
          <img :src="bookmarkIcon" alt="북마크" />
        </button>
      </template>
    </SimpleHeader>

    <!-- 본문 -->
    <div class="listings-page">
      <!-- 좌측 필터 영역(추후 구현) + 우측 보기 전환 -->
      <div class="controls">
        <div class="filters">
          <!-- height 60px 필터 컴포넌트 자리(추후 구현) -->
        </div>

        <button
          class="view-toggle-btn"
          @click="toggleView"
          :aria-label="viewMode === 'list' ? '그리드 보기로 전환' : '리스트 보기로 전환'"
        >
          <img
            :src="toggleIcon"
            :alt="viewMode === 'list' ? '그리드 아이콘' : '리스트 아이콘'"
          />
        </button>
      </div>

      <!-- 리스트 모드 -->
      <section v-if="viewMode === 'list'" class="list-mode">
        <ListingCard
          v-for="item in paginatedItems"
          :key="item.id"
          :id="item.id"
          :img="item.img"
          :category="item.category"
          :dealType="item.dealType"
          :deposit="item.deposit"
          :rent="item.rent"
          :salePrice="item.salePrice"
          :premium="item.premium"
          :areaPyeong="item.areaPyeong"
          :location="item.location"
        />
      </section>

      <!-- 그리드 모드 -->
      <section v-else class="grid-mode">
        <ListingCardGrid
          v-for="item in paginatedItems"
          :key="item.id"
          :id="item.id"
          :img="item.img"
          :category="item.category"
          :dealType="item.dealType"
          :deposit="item.deposit"
          :rent="item.rent"
          :salePrice="item.salePrice"
          :premium="item.premium"
          :areaPyeong="item.areaPyeong"
          :location="item.location"
        />
      </section>

      <!-- 페이지네이션 5개 윈도우 -->
      <nav class="pagination" aria-label="페이지네이션" v-if="totalPages > 1">
        <button class="page-btn first bodyMedium14px" :disabled="currentPage === 1" @click="goFirst">«</button>
        <button class="page-btn prev bodyMedium14px" :disabled="currentPage === 1" @click="prevPage">‹</button>

        <button
          v-for="p in visiblePageNumbers"
          :key="p"
          class="page-num bodyMedium14px"
          :class="{ active: p === currentPage }"
          @click="goPage(p)"
        >
          {{ p }}
        </button>

        <button class="page-btn next bodyMedium14px" :disabled="currentPage === totalPages" @click="nextPage">›</button>
        <button class="page-btn last bodyMedium14px" :disabled="currentPage === totalPages" @click="goLast">»</button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import ListingCard from '@/pages/listing/components/ListingCard.vue'
import ListingCardGrid from '@/pages/listing/components/ListingCardGrid.vue'

import gridIcon from '@/assets/icons/grid-icon.png'
import listIcon from '@/assets/icons/list-icon.png'
import bookmarkIcon from '@/assets/icons/bookmark.png'

const router = useRouter()

/** 보기 전환 */
const VIEW_KEY = 'listing-view-mode'
const viewMode = ref('list')
const toggleIcon = computed(() => (viewMode.value === 'list' ? gridIcon : listIcon))
function toggleView() {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
  localStorage.setItem(VIEW_KEY, viewMode.value)
}
onMounted(() => {
  const saved = localStorage.getItem(VIEW_KEY)
  if (saved === 'grid' || saved === 'list') viewMode.value = saved
})

/** 북마크 페이지 이동 */
function goBookmarks() {
  router.push({ name: 'my-bookmarks' })
}

/** 더미 데이터 10개 */
const items = ref([
  { id: 101, img: 'https://picsum.photos/seed/101/600/400', category: '일반음식점/양식', dealType: '월세', deposit: 2000, rent: 160, premium: 3500, areaPyeong: 10, location: '제주시 애월읍' },
  { id: 102, img: 'https://picsum.photos/seed/102/600/400', category: '주류음식점/양식', dealType: '매매', salePrice: 30000, rent: 400, premium: 20500, areaPyeong: 24, location: '부천시 상동' },
  { id: 103, img: 'https://picsum.photos/seed/103/600/400', category: '카페', dealType: '월세', deposit: 1000, rent: 90, premium: 2500, areaPyeong: 12, location: '서울 강남구 역삼동' },
  { id: 104, img: 'https://picsum.photos/seed/104/600/400', category: '베이커리', dealType: '월세', deposit: 3000, rent: 220, premium: 5000, areaPyeong: 18, location: '분당구 정자동' },
  { id: 105, img: 'https://picsum.photos/seed/105/600/400', category: '일반음식점/한식', dealType: '매매', salePrice: 45000, rent: 0, premium: 0, areaPyeong: 30, location: '부산 수영구 광안동' },
  { id: 106, img: 'https://picsum.photos/seed/106/600/400', category: '편의점', dealType: '월세', deposit: 5000, rent: 320, premium: 8000, areaPyeong: 20, location: '서울 마포구 합정동' },
  { id: 107, img: 'https://picsum.photos/seed/107/600/400', category: '사무실', dealType: '월세', deposit: 10000, rent: 650, premium: null, areaPyeong: 35, location: '서울 성수동' },
  { id: 108, img: 'https://picsum.photos/seed/108/600/400', category: '주류음식점/한식', dealType: '월세', deposit: 1500, rent: 120, premium: 1500, areaPyeong: 11, location: '광주 동구 충장로' },
  { id: 109, img: 'https://picsum.photos/seed/109/600/400', category: '카페', dealType: '매매', salePrice: 22000, rent: 180, premium: 3000, areaPyeong: 16, location: '대구 수성구 범어동' },
  { id: 110, img: 'https://picsum.photos/seed/110/600/400', category: '일반음식점/중식', dealType: '월세', deposit: 2500, rent: 190, premium: 2800, areaPyeong: 14, location: '인천 연수구 송도동' },
])

/** 페이지네이션 (8개/페이지, 5개 윈도우) */
const pageSize = 8
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize)))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return items.value.slice(start, start + pageSize)
})

function goPage(p) { currentPage.value = Math.min(Math.max(1, p), totalPages.value) }
function prevPage() { goPage(currentPage.value - 1) }
function nextPage() { goPage(currentPage.value + 1) }
function goFirst()  { goPage(1) }
function goLast()   { goPage(totalPages.value) }

watch(totalPages, (t) => { if (currentPage.value > t) currentPage.value = t })

const windowSize = 5
const windowStart = computed(() => Math.floor((currentPage.value - 1) / windowSize) * windowSize + 1)
const windowEnd   = computed(() => Math.min(windowStart.value + windowSize - 1, totalPages.value))
const visiblePageNumbers = computed(() =>
  Array.from({ length: windowEnd.value - windowStart.value + 1 }, (_, i) => windowStart.value + i)
)
</script>

<style scoped>
.bookmark-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  margin-left: auto;
}

.bookmark-btn img {
  width: 24px;
  height: 24px;
  display: block;
}

.listings-page {
  padding: 0 16px;
}

.controls {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filters {
  flex: 1;
}

.view-toggle-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-lightgray);
  background: var(--color-white);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.view-toggle-btn img {
  width: 20px;
  height: 20px;
  display: block;
}

.list-mode {
  margin-top: 8px;
}

.grid-mode {
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: 16px 0 4px;
}

.page-btn,
.page-num {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--color-lightgray);
  background: var(--color-white);
  color: var(--color-black);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-num.active {
  background: var(--color-primary-10);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
