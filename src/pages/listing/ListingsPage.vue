<!-- src/pages/listing/ListingsPage.vue -->
<template>
  <div class="listings-wrap">
    <SimpleHeader :show-button="false" title="매물 리스트">
      <template #action>
        <button
          class="view-toggle-btn"
          @click="toggleView"
          :aria-label="
            viewMode === 'list' ? '그리드 보기로 전환' : '리스트 보기로 전환'
          "
        >
          <img
            :src="toggleIcon"
            :alt="viewMode === 'list' ? '그리드 아이콘' : '리스트 아이콘'"
          />
        </button>
      </template>
    </SimpleHeader>

    <!-- 헤더 아래 필터 -->
    <div class="listings-page">
      <div class="filters-wrap">
        <ListingFilter v-model="filters" />
      </div>

      <!-- 리스트 모드 -->
      <section v-if="viewMode === 'list'" class="list-mode">
        <ListingCard
          v-for="item in paginatedItems"
          :key="item.id"
          :id="item.id"
          :img="item.img"
          :industry="item.industry"
          :transactionType="item.transactionType"
          :deposit="item.deposit"
          :rent="item.rent"
          :salePrice="item.salePrice"
          :premium="item.premium"
          :exclusiveArea="item.exclusiveArea"
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
          :industry="item.industry"
          :transactionType="item.transactionType"
          :deposit="item.deposit"
          :rent="item.rent"
          :salePrice="item.salePrice"
          :premium="item.premium"
          :exclusiveArea="item.exclusiveArea"
          :location="item.location"
        />
      </section>

      <nav class="pagination" aria-label="페이지네이션" v-if="totalPages > 1">
        <button
          class="page-btn first bodyMedium14px"
          :disabled="currentPage === 1"
          @click="goFirst"
        >
          «
        </button>
        <button
          class="page-btn prev bodyMedium14px"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          ‹
        </button>

        <button
          v-for="p in visiblePageNumbers"
          :key="p"
          class="page-num bodyMedium14px"
          :class="{ active: p === currentPage }"
          @click="goPage(p)"
        >
          {{ p }}
        </button>

        <button
          class="page-btn next bodyMedium14px"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          ›
        </button>
        <button
          class="page-btn last bodyMedium14px"
          :disabled="currentPage === totalPages"
          @click="goLast"
        >
          »
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import ListingCard from '@/pages/listing/components/ListingCard.vue';
import ListingCardGrid from '@/pages/listing/components/ListingCardGrid.vue';
import ListingFilter from '@/pages/listing/components/ListingFilter.vue';

import gridIcon from '@/assets/icons/grid-icon.png';
import listIcon from '@/assets/icons/list-icon.png';
import fallbackImg from '@/assets/images/fallback-image.png';

const router = useRouter();

const VIEW_KEY = 'listing-view-mode';
const viewMode = ref('list');
const toggleIcon = computed(() =>
  viewMode.value === 'list' ? gridIcon : listIcon
);
function toggleView() {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list';
  localStorage.setItem(VIEW_KEY, viewMode.value);
}
onMounted(() => {
  const saved = localStorage.getItem(VIEW_KEY);
  if (saved === 'grid' || saved === 'list') viewMode.value = saved;
});

/* 필터 상태 (필요시 연결해서 사용 가능) */
const filters = ref({
  major: '',
  minor: '',
  dealType: 'ALL',
  premium: { min: 0, max: 200_000_000 },
  salePrice: { min: 0, max: 2_000_000_000 },
  deposit: { min: 0, max: 300_000_000 },
  rent: { min: 0, max: 10_000_000 },
  areaPyeong: { min: 0, max: 200 },
});

function asDataUrl(base64, mime = 'image/png') {
  if (!base64 || typeof base64 !== 'string') return null;
  if (base64 === 'string') return null; // 예시 placeholder 방지
  if (base64.startsWith('data:')) return base64;
  const clean = base64.replace(/\s+/g, '');
  if (clean.length < 50) return null; // 너무 짧으면 이미지 취급 X
  return `data:${mime};base64,${clean}`;
}

// id → 이미지 src 맵
function buildImageMap(rows) {
  const m = new Map();
  for (const r of rows || []) {
    const id = Number(r?.propertyId ?? r?.id);
    const src = asDataUrl(r?.representativeImage);
    if (Number.isFinite(id) && src) m.set(id, src);
  }
  return m;
}

function m2toPyeong(m2) {
  const n = Number(m2);
  return Number.isFinite(n) ? Number((n / 3.305785).toFixed(1)) : undefined;
}

function mapListing(r, imagesById) {
  const idRaw = r?.propertyId ?? r?.id;
  const id = Number.isFinite(Number(idRaw)) ? Number(idRaw) : undefined;

  return {
    id,
    propertyId: r?.propertyId,
    img: imagesById.get(id) || fallbackImg,

    industry: r?.industry,
    transactionType: r?.transactionType,
    deposit: r?.deposit,
    rent: r?.rent,
    salePrice: r?.salePrice,
    premium: r?.premium,
    exclusiveArea: m2toPyeong(
      r?.exclusiveArea ??
        r?.area?.exclusive ??
        (r?.area?.supply ? r.area.supply * 0.75 : undefined)
    ),
    location: r?.address,
    lat: r?.lat,
    lng: r?.lng,
  };
}

const pageSize = 8;
const currentPage = ref(1);
const rawItems = ref([]);

const sortedItems = computed(() =>
  rawItems.value.slice().sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
);
const totalItems = computed(() => sortedItems.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / pageSize))
);
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedItems.value.slice(start, start + pageSize);
});

async function fetchAll() {
  try {
    const [listRes, imgRes] = await Promise.all([
      axios.get('http://localhost:8080/api/property/card_list'),
      axios.get('http://localhost:8080/api/posts/card_list'),
    ]);

    const list = Array.isArray(listRes?.data?.data) ? listRes.data.data : [];
    const images = Array.isArray(imgRes?.data?.data) ? imgRes.data.data : [];

    // id → src
    const imagesById = buildImageMap(images);

    // 혹시 리스트 row 안에 대표이미지가 같이 오는 환경 대비(보충)
    for (const r of list) {
      const id = Number(r?.propertyId ?? r?.id);
      if (!imagesById.has(id)) {
        const candidate = asDataUrl(r?.representativeImage);
        if (Number.isFinite(id) && candidate) imagesById.set(id, candidate);
      }
    }

    rawItems.value = list.map((r) => mapListing(r, imagesById));

    if (currentPage.value > totalPages.value)
      currentPage.value = totalPages.value;
  } catch (e) {
    console.warn('[listings] fetchAll fail:', e);
    rawItems.value = [];
    currentPage.value = 1;
  }
}

function goPage(p) {
  const np = Math.min(Math.max(1, p), totalPages.value);
  if (np === currentPage.value) return;
  currentPage.value = np;
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
function prevPage() {
  goPage(currentPage.value - 1);
}
function nextPage() {
  goPage(currentPage.value + 1);
}
function goFirst() {
  goPage(1);
}
function goLast() {
  goPage(totalPages.value);
}

const windowSize = 5;
const windowStart = computed(
  () => Math.floor((currentPage.value - 1) / windowSize) * windowSize + 1
);
const windowEnd = computed(() =>
  Math.min(windowStart.value + windowSize - 1, totalPages.value)
);
const visiblePageNumbers = computed(() =>
  Array.from(
    { length: windowEnd.value - windowStart.value + 1 },
    (_, i) => windowStart.value + i
  )
);

onMounted(() => {
  fetchAll();
});
</script>

<style scoped>
.listings-page {
  padding: 0 16px;
}

.filters-wrap {
  margin-top: 8px;
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
.grid-mode > * {
  min-width: 0;
}

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
