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

/* -------------------------------------------
gpt가 아래처럼 서버에서 페이지네이션 받아오는 게 좋다고 해서 일단 뒀는데,
백엔드에서 처리하기 번거로울 것 같으면 그냥 전부 받아와서 프론트에서 페이지네이션하는 걸로
변경예정 (leeday)
   json-server 연동: 서버사이드 페이지네이션
   - /api/listings?_page=1&_limit=8&_sort=id&_order=desc
   - X-Total-Count 헤더로 전체개수 수신
------------------------------------------- */

/** 뷰 모델 매핑 db.json에서 카드 props */
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
const items = ref([]) 
const totalItems = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize)))

const paginatedItems = computed(() => items.value)

/** 서버에서 현재 페이지 가져오기 */
async function fetchPage(p = 1) {
  try {
    const { data, headers } = await axios.get('/listings', {
      params: {
        _page: p,
        _limit: pageSize,
        _sort: 'id',
        _order: 'desc'
      }
    })
    items.value = (Array.isArray(data) ? data : []).map(mapListing)
    // json-server가 주는 전체 개수
    const total = Number(headers['x-total-count'] || 0)
    if (total) totalItems.value = total
    // 헤더가 없으면(예외) 첫 페이지 길이로 대략 설정
    if (!totalItems.value && p === 1) totalItems.value = items.value.length
  } catch (e) {
    console.warn('[listings] fetch fail:', e)
    items.value = []
  }
}

/** 페이지 이동 로직 */
function goPage(p) { currentPage.value = Math.min(Math.max(1, p), totalPages.value) }
function prevPage() { goPage(currentPage.value - 1) }
function nextPage() { goPage(currentPage.value + 1) }
function goFirst()  { goPage(1) }
function goLast()   { goPage(totalPages.value) }

/** 페이지 변경 시 서버 재호출 */
watch(currentPage, (p) => { fetchPage(p) })

/** 페이지 윈도우 */
const windowSize = 5
const windowStart = computed(() => Math.floor((currentPage.value - 1) / windowSize) * windowSize + 1)
const windowEnd   = computed(() => Math.min(windowStart.value + windowSize - 1, totalPages.value))
const visiblePageNumbers = computed(() =>
  Array.from({ length: windowEnd.value - windowStart.value + 1 }, (_, i) => windowStart.value + i)
)

/** 초기 로딩 */
onMounted(() => {
  fetchPage(currentPage.value)
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
