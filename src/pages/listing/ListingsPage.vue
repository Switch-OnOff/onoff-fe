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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
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

/** 카드 매핑 */
function m2toPyeong(m2) {
  const n = Number(m2)
  return Number.isFinite(n) ? Number((n / 3.305785).toFixed(1)) : undefined
}
function mapListing(r) {
  return {
    id: r.id,
    img: r.images?.[0] || 'https://placehold.co/600x400?text=IMG',
    category: r.industry,
    dealType: r.dealType,
    deposit: r.deposit,
    rent: r.rent,
    salePrice: r.salePrice,
    premium: r.premium,
    areaPyeong: m2toPyeong(r?.area?.exclusive ?? r?.area?.supply * 0.75),
    location: r.address,
    lat: r.lat,
    lng: r.lng,
  }
}

/** 데이터 & 페이징 상태 */
const pageSize = 8
const currentPage = ref(1)
const rawItems = ref([])

const sortedItems = computed(() =>
  rawItems.value.slice().sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
)
const totalItems = computed(() => sortedItems.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize)))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return sortedItems.value.slice(start, end)
})

async function fetchAll() {
  try {
    const { data } = await axios.get('/listings')
    const rows = Array.isArray(data) ? data : []
    rawItems.value = rows.map(mapListing)
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  } catch (e) {
    console.warn('[listings] fetchAll fail:', e)
    rawItems.value = []
    currentPage.value = 1
  }
}

/** 페이지 이동 */
function goPage(p) {
  const np = Math.min(Math.max(1, p), totalPages.value)
  if (np === currentPage.value) return
  currentPage.value = np
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}
function prevPage() { goPage(currentPage.value - 1) }
function nextPage() { goPage(currentPage.value + 1) }
function goFirst()  { goPage(1) }
function goLast()   { goPage(totalPages.value) }

/** 페이지 윈도우 */
const windowSize = 5
const windowStart = computed(() => Math.floor((currentPage.value - 1) / windowSize) * windowSize + 1)
const windowEnd   = computed(() => Math.min(windowStart.value + windowSize - 1, totalPages.value))
const visiblePageNumbers = computed(() =>
  Array.from({ length: windowEnd.value - windowStart.value + 1 }, (_, i) => windowStart.value + i)
)

/** 초기 로딩 */
onMounted(() => {
  fetchAll()
})
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
/* 그리드 아이템이 내부 콘텐츠 때문에 폭을 밀어내지 않도록 */
.grid-mode > * { min-width: 0; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: 12px 0;
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
