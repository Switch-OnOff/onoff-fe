<!-- pages/listing/ListingDetailPage.vue -->
<template>
  <div class="detail-page">
    <SimpleHeader title="매물 상세" />

    <!-- 사진 -->
    <section class="gallery"
      @mouseenter="pauseAuto"
      @mouseleave="resumeAuto"
      @touchstart.passive="pauseAuto"
      @touchend.passive="resumeAuto"
    >
      <div class="gallery-track" ref="galleryRef" @scroll.passive="onGalleryScroll">
        <img
          v-for="(src, i) in images"
          :key="i"
          :src="src"
          :alt="listing.storeName || '매장 사진'"
          class="slide"
          loading="lazy"
          @error="onImgError"
        />
      </div>

      <!-- 좌우 네비 버튼 (이미지가 2장 이상일 때만) -->
      <button
        v-if="hasMultiple"
        type="button"
        class="gallery-nav left"
        aria-label="이전 사진"
        @click="prevSlide"
      >‹</button>
      <button
        v-if="hasMultiple"
        type="button"
        class="gallery-nav right"
        aria-label="다음 사진"
        @click="nextSlide"
      >›</button>

      <div class="gallery-indicator bodyRegular12px">
        {{ currentSlide }} / {{ images.length }}
      </div>
    </section>

    <!-- 업종, 월세, 상호명 -->
    <section class="section head">
      <div class="badge bodyMedium12px" v-if="listing.industry">{{ listing.industry }}</div>

      <h1 class="titleExtra24px price-headline">{{ mainPriceLine }}</h1>
      <div class="store-name bodyMedium16px" v-if="listing.storeName">{{ listing.storeName }}</div>

      <div class="price-block">
        <div class="stats-3">
          <div class="stat-ball">
            <div class="stat-label bodyRegular14px">권리금</div>
            <div class="stat-value bodyBold20px">{{ premiumText }}</div>
          </div>
          <div class="stat-ball">
            <div class="stat-label bodyRegular12px">양도가능일</div>
            <div class="stat-value bodyBold16px">{{ transferText }}</div>
          </div>
          <div class="stat-ball">
            <div class="stat-label bodyRegular12px">관리비</div>
            <div class="stat-value bodyBold16px">{{ mgmtText }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 그 외 사항 -->
    <section class="section facts">
      <div class="spec-table-wrap">
        <table class="spec-table" role="table">
          <tbody>
            <tr>
              <th scope="row" class="bodyRegular14px">상가형태</th>
              <td class="bodyMedium16px">{{ listing.shopType || '-' }}</td>
            </tr>
            <tr>
              <th scope="row" class="bodyRegular14px">공급/전용</th>
              <td class="bodyMedium16px">
                <span v-if="listing.area?.supply">{{ listing.area.supply }}m²</span><span v-else>-</span>
                <span> / </span>
                <span v-if="listing.area?.exclusive">{{ listing.area.exclusive }}m²</span><span v-else>-</span>
                <span class="value-hint bodyRegular14px" v-if="listing.area?.supply || listing.area?.exclusive">
                  (≈ {{ toPyeong(listing.area?.supply) }}평 / {{ toPyeong(listing.area?.exclusive) }}평)
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row" class="bodyRegular14px">해당층/전체층</th>
              <td class="bodyMedium16px">{{ floorText }}</td>
            </tr>
            <tr>
              <th scope="row" class="bodyRegular14px">주차</th>
              <td class="bodyMedium16px">
                <template v-if="listing.parking?.type === '가능'">
                  가능 ({{ listing.parking?.count ?? '?' }}대 / {{ listing.parking?.paid ? '유료' : '무료' }})
                </template>
                <template v-else>{{ listing.parking?.type || '-' }}</template>
              </td>
            </tr>
            <tr>
              <th scope="row" class="bodyRegular14px">화장실</th>
              <td class="bodyMedium16px">{{ listing.restroom || '-' }}</td>
            </tr>
            <tr>
              <th scope="row" class="bodyRegular14px">운영 형태</th>
              <td>
                <div class="chips">
                  <span class="chip bodyMedium14px">배달: {{ listing.deliveryLevel }}</span>
                  <span class="chip bodyMedium14px">포장: {{ listing.takeoutLevel }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 카카오맵 -->
    <section class="section">
      <KakaoMapAddress
        :address="listing.address"
        :title="listing.storeName"
        :level="3"
        height="180px"
        heading="위치"
        :show-copy="true"
      />
    </section>

    <!-- 상세설명 -->
    <section class="section description">
      <p class="bodyBold16px">상세설명</p>
      <div class="desc-card">
        <ul class="desc-list">
          <li
            v-for="(para, i) in descriptionParas"
            :key="i"
            class="desc-item bodyRegular14px"
            v-text="para"
          />
        </ul>
      </div>
    </section>

    <section class="section cta-static">
      <div class="cta-row">
        <button type="button" class="btn-secondary bodyMedium16px" @click="openShare">공유</button>
        <button type="button" class="btn-primary bodyMedium16px" @click="contact">문의하기</button>
      </div>
    </section>

    <ShareSheet
      :open="shareOpen"
      :title="shareTitle"
      :text="shareText"
      :url="shareUrl"
      @close="shareOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios' 

import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import ShareSheet from '@/components/common/ShareSheet.vue'
import KakaoMapAddress from '@/components/map/KakaoMapAddress.vue'
import fallbackImg from '@/assets/images/fallback-image.png'

const route = useRoute()

const listing = ref({})

const images = computed(() =>
  Array.isArray(listing.value.images) && listing.value.images.length
    ? listing.value.images
    : [fallbackImg]   // ← 여기!
)

function onImgError(e) {
  const img = e.target
  img.onerror = null        // 무한 에러 루프 방지
  img.src = fallbackImg     // 풀백으로 교체
}

const hasMultiple = computed(() => images.value.length > 1)

const galleryRef = ref(null)
const currentSlide = ref(1)

function fmt(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '-'
  const eok = Math.floor(n / 10000)
  const man = n % 10000
  return eok > 0 ? `${eok}억 ${man.toLocaleString()}` : man.toLocaleString()
}

const mainPriceLine = computed(() => {
  if (listing.value.dealType === '매매') {
    return `매매 ${fmt(listing.value.salePrice)}${
      listing.value.rent ? ` ${fmt(listing.value.rent)}` : ''
    }`
  }
  return `월세 ${fmt(listing.value.deposit)}/${fmt(listing.value.rent)}`
})

const premiumText = computed(() =>
  listing.value.premium == null ? '-' : fmt(listing.value.premium)
)

const mgmtText = computed(() =>
  listing.value.mgmtFee == null ? '-' : fmt(listing.value.mgmtFee)
)

const transferText = computed(() => {
  const t = listing.value.transfer?.type
  if (!t) return '-'
  if (t === '지정') return listing.value.transfer?.date || '협의'
  return t
})

function toPyeong(m2) {
  const n = Number(m2)
  if (!Number.isFinite(n)) return '-'
  return (n / 3.305785).toFixed(1)
}

const floorText = computed(() => {
  const c = listing.value.floor?.current ?? '-'
  const t = listing.value.floor?.total ?? '-'
  return `${c}/${t}층`
})

function onGalleryScroll() {
  const el = galleryRef.value
  if (!el) return
  const idx = Math.round(el.scrollLeft / el.clientWidth) + 1
  currentSlide.value = Math.min(Math.max(idx, 1), images.value.length)
  restartAuto()
}

/* 오토플레이 */
const AUTO_MS = 3500
let autoTimer = null
let resumeTimer = null

function goSlide(i) {
  const el = galleryRef.value
  if (!el) return
  const idx = Math.min(Math.max(i, 1), images.value.length)
  el.scrollTo({ left: (idx - 1) * el.clientWidth, behavior: 'smooth' })
}

function nextSlide() {
  if (!hasMultiple.value) return
  const n = currentSlide.value % images.value.length + 1
  goSlide(n)
}

function prevSlide() {
  if (!hasMultiple.value) return
  const n = (currentSlide.value - 2 + images.value.length) % images.value.length + 1
  goSlide(n)
}

function startAuto() {
  if (!hasMultiple.value || autoTimer) return
  autoTimer = setInterval(nextSlide, AUTO_MS)
}

function stopAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
}

function restartAuto() {
  stopAuto()
  if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null }
  resumeTimer = setTimeout(() => startAuto(), 1200)
}

function pauseAuto() {
  stopAuto()
  if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null }
}

function resumeAuto() {
  restartAuto()
}

/* 상세 로드 */
async function fetchDetail(id) {
  try {
    const { data } = await axios.get(`/listings/${id}`)
    listing.value = data
    requestAnimationFrame(() => {
      onGalleryScroll()
      startAuto()
    })
  } catch (e) {
    console.warn('[ListingDetail] fetch fail:', e)
  }
}

onMounted(() => {
  const id = route.params.id || 1
  fetchDetail(id)
  document.addEventListener('visibilitychange', onVis)
})

function onVis() {
  if (document.hidden) pauseAuto()
  else resumeAuto()
}

onBeforeUnmount(() => {
  pauseAuto()
  document.removeEventListener('visibilitychange', onVis)
})

const descriptionParas = computed(() =>
  (listing.value.description || '')
    .split(/\n\s*\n/g)
    .map(s => s.trim())
    .filter(Boolean)
)

const shareOpen = ref(false)
const shareTitle = computed(() => listing.value.storeName || '매물 상세')
const shareText = computed(() => `${listing.value.industry} · ${mainPriceLine.value}`)
const shareUrl = computed(() => `${location.origin}${route.fullPath}`)
function openShare() { shareOpen.value = true }

function contact() { alert('1:1 채팅으로 연결합니다.') }
</script>

<style scoped>
.detail-page {
  padding-bottom: 0;
  background: var(--color-white);
}

.gallery {
  position: relative;
}

.gallery-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.gallery-track::-webkit-scrollbar {
  display: none;
}

.slide {
  min-width: 100%;
  height: 240px;
  object-fit: cover;
  scroll-snap-align: center;
}

.gallery-indicator {
  position: absolute;
  right: 12px;
  bottom: 10px;
  background: rgba(0, 0, 0, 0.55);
  color: var(--color-white);
  border-radius: 999px;
  padding: 4px 8px;
}

/* 좌우 네비 버튼 */
.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,.22);
  color: var(--color-white);
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background .15s ease;
  -webkit-tap-highlight-color: transparent;
}
.gallery-nav:hover { background: rgba(0,0,0,.32); }
.gallery-nav.left  { left: 8px; }
.gallery-nav.right { right: 8px; }

.section { padding: 16px; color: var(--color-primary); }
.head { padding-top: 12px; }

.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  background: var(--color-primary-10);
  color: var(--color-primary);
  border-radius: 6px;
  margin-bottom: 6px;
}

.price-headline {
  margin: 4px 0 6px;
  color: var(--color-black);
}

.store-name {
  color: var(--color-darkgray);
  margin-bottom: 10px;
}

.price-block {
  border: none;
  background: transparent;
  padding: 4px 0 0 0;
}

.stats-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  justify-items: center;
  align-items: center;
}

.stat-ball {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: var(--color-primary-10);
  border: 1px solid var(--color-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
  padding: 8px;
}

.stat-label {
  color: var(--color-black);
  line-height: 1;
}

.stat-value {
  color: var(--color-primary);
  line-height: 1.1;
}

.facts {
  padding-top: 0px;
}

.spec-table-wrap {
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-white);
}

.spec-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.spec-table th,
.spec-table td {
  padding: 12px 14px;
  vertical-align: middle;
}

.spec-table th {
  width: 96px;
  text-align: left;
  color: var(--color-darkgray);
  background: var(--color-white);
  white-space: nowrap;
}

.spec-table td {
  color: var(--color-black);
}

.spec-table tr + tr th,
.spec-table tr + tr td {
  border-top: 1px solid var(--color-lightgray);
}

.value-hint {
  display: inline-block;
  margin-left: 6px;
  color: var(--color-mediumgray);
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  padding: 1px 10px;
  border-radius: 999px;
  background: var(--color-primary-10);
  color: var(--color-primary);
}

.description p {
  text-align: center;
  background-color: var(--color-primary-10);
  border-radius: 12px 12px 0 0;
  padding: 4px 0;
}

.desc-card {
  border: 1px solid var(--color-lightgray);
  border-radius: 0 0 12px 12px;
  background: var(--color-white);
  padding: 12px 14px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
}

.desc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.desc-item {
  color: var(--color-black);
  line-height: 1.75;
  letter-spacing: -0.01em;
  word-break: keep-all;
  margin: 0;
  text-indent: 1em;
  padding-left: 8px;
}

.cta-static {
  padding-top: 8px;
}

.cta-row {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-white);
  flex: 1;
  border-radius: 12px;
  padding: 14px 12px;
  cursor: pointer;
}

.btn-secondary {
  background: var(--color-white);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  flex: 0 0 36%;
  border-radius: 12px;
  padding: 14px 12px;
  cursor: pointer;
}
</style>
