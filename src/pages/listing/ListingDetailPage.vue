<!-- pages/listing/ListingDetailPage.vue -->
<template>
  <div class="detail-page">
    <SimpleHeader title="매물 상세" />

    <!-- 사진 -->
    <section class="gallery">
      <div class="gallery-track" ref="galleryRef" @scroll.passive="onGalleryScroll">
        <img v-for="(src, i) in images" :key="i" :src="src" alt="" class="slide" />
      </div>
      <div class="gallery-indicator bodyRegular12px">
        {{ currentSlide }} / {{ images.length }}
      </div>
    </section>

    <!-- 업종, 월세, 상호명 -->
    <section class="section head">
      <div class="badge bodyMedium12px" v-if="listing.industry">{{ listing.industry }}</div>

      <h1 class="titleExtra24px price-headline">{{ mainPriceLine }}</h1>
      <div class="store-name bodyMedium16px" v-if="listing.storeName">{{ listing.storeName }}</div>

      <!-- 권리금, 양도가능일, 관리비 -->
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

    <!-- 그 외의 사항 -->
    <section class="section facts">
      <div class="spec-table-wrap">
        <table class="spec-table" role="table">
          <tbody>
            <tr>
              <th scope="row" class="bodyRegular12px">상가형태</th>
              <td class="bodyMedium16px">{{ listing.shopType || '-' }}</td>
            </tr>
            <tr>
              <th scope="row" class="bodyRegular12px">공급/전용</th>
              <td class="bodyMedium16px">
                <span v-if="listing.area?.supply">{{ listing.area.supply }}m²</span><span v-else>-</span>
                <span> / </span>
                <span v-if="listing.area?.exclusive">{{ listing.area.exclusive }}m²</span><span v-else>-</span>
                <span class="value-hint bodyRegular12px" v-if="listing.area?.supply || listing.area?.exclusive">
                  (≈ {{ toPyeong(listing.area?.supply) }}평 / {{ toPyeong(listing.area?.exclusive) }}평)
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row" class="bodyRegular12px">해당층/전체층</th>
              <td class="bodyMedium16px">{{ floorText }}</td>
            </tr>
            <tr>
              <th scope="row" class="bodyRegular12px">주차</th>
              <td class="bodyMedium16px">
                <template v-if="listing.parking?.type === '가능'">
                  가능 ({{ listing.parking?.count ?? '?' }}대 / {{ listing.parking?.paid ? '유료' : '무료' }})
                </template>
                <template v-else>{{ listing.parking?.type || '-' }}</template>
              </td>
            </tr>
            <tr>
              <th scope="row" class="bodyRegular12px">화장실</th>
              <td class="bodyMedium16px">{{ listing.restroom || '-' }}</td>
            </tr>
            <tr>
              <th scope="row" class="bodyRegular12px">운영 형태</th>
              <td>
                <div class="chips">
                  <span class="chip bodyMedium12px">배달: {{ listing.deliveryLevel }}</span>
                  <span class="chip bodyMedium12px">포장: {{ listing.takeoutLevel }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 위치 (추후 카카오맵 연동 필요) -->
    <section class="section location">
      <div class="loc-head">
        <h2 class="bodyMedium16px">위치</h2>
        <button type="button" class="btn-ghost bodyMedium12px" @click="copyAddress">주소 복사</button>
      </div>
      <div class="address bodyMedium14px">{{ listing.address }}</div>
      <div class="map" role="img" aria-label="지도 영역 (카카오맵 연동 자리)">카카오맵 연동 영역</div>
    </section>

    <!-- 상세설명 -->
    <section class="section description">
      <h2 class="bodyMedium16px">상세설명</h2>
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
        <button type="button" class="btn-secondary bodyMedium16px" @click="share">공유</button>
        <button type="button" class="btn-primary bodyMedium16px" @click="contact">문의하기</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SimpleHeader from '@/components/layout/SimpleHeader.vue'

const route = useRoute()

function getMockById(id) {
  return {
    id,
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529429612779-c8e40ef2f36d?q=80&w=1200&auto=format&fit=crop'
    ],
    industry: '일반음식점/양식',
    storeName: '블루빈스 강남점',
    dealType: '월세',
    deposit: 2000,
    rent: 160,
    premium: 3500,
    mgmtFee: 10,
    transfer: { type: '협의', date: '' },
    shopType: '근린상가',
    area: { supply: 66, exclusive: 49.5 },
    floor: { current: 1, total: 12 },
    parking: { type: '가능', count: 3, paid: true },
    restroom: '공용',
    address: '서울 강남구 테헤란로 123',
    deliveryLevel: '보통',
    takeoutLevel: '많음',
    description: `지하철 ○○역 도보 2분 거리의 코너 상권으로, 2면 노출 및 넓은 전면(약 8m)으로 가시성이 매우 우수합니다. 출퇴근·점심 시간대 유동 인구가 풍부하고, 주말에는 인근 아파트·학원가·공원 방문객까지 더해져 요일별로 안정적인 고객 흐름이 형성됩니다.

최근 내부 리모델링으로 바닥/벽체 정비, 급·배수 배관 교체, 전기(약 40kW) 및 가스(25mm) 증설, 1,500 사이즈 후드와 급·배기 라인 보강을 완료했습니다. 홀은 테이블 8세트 기준 28~32석 배치가 가능하며, 동선이 깔끔해 회전율이 좋습니다. 냉난방은 개별 시스템으로 여름·겨울 모두 안정적으로 운영됩니다.

주방에는 6구 렌지와 플랫 그릴, 테이블 냉장·냉동 각 2대(총 4대), 제빙기, 2절 싱크 및 준비대가 갖춰져 있어 즉시 영업이 가능하며, 배달·포장 픽업 동선이 홀과 분리되어 피크 타임 병목을 줄였습니다. 권리금에는 주요 집기·설비가 포함되어 있으며, 일부 품목은 협의 가능합니다.

상권은 프랜차이즈 카페, 편의점, 피트니스, 병원 등 앵커 테넌트가 밀집해 상주 인구가 탄탄합니다. 현재는 런치 위주의 파스타/라이스, 디너 간단한 와인/맥주 페어링으로 운영 중이며 배달·포장 비중은 약 30% 수준입니다. 영업시간은 11:00~22:00(주 1회 휴무)로 유지하고 있고, 브런치/야간 영업 확대 시 매출 증대 여지가 큽니다.

건물 내·인근 공영주차와 제휴되어 고객 1시간 감면이 가능하며, 인수 시 바로 영업이 가능한 상태입니다. 양도 가능일은 ‘협의’이며, 세부 조건 및 포함 내역은 미팅 시 상세 안내드리겠습니다.`
  }
}

const listing = ref(getMockById(route.params.id || 1))
const images = computed(() =>
  listing.value.images?.length ? listing.value.images : ['https://placehold.co/1200x900?text=STORE']
)
const galleryRef = ref(null)
const currentSlide = ref(1)


/* 포맷 */
function fmt(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '-'
  const eok = Math.floor(n / 10000)
  const man = n % 10000
  return eok > 0 ? `${eok}억 ${man.toLocaleString()}` : man.toLocaleString()
}

const mainPriceLine = computed(() => {
  if (listing.value.dealType === '매매') {
    return `매매 ${fmt(listing.value.salePrice)}${listing.value.rent ? ` ${fmt(listing.value.rent)}` : ''}`
  }
  return `월세 ${fmt(listing.value.deposit)}/${fmt(listing.value.rent)}`
})

const premiumText = computed(() => (listing.value.premium == null ? '-' : fmt(listing.value.premium)))
const mgmtText = computed(() => (listing.value.mgmtFee == null ? '-' : fmt(listing.value.mgmtFee)))
const transferText = computed(() => {
  const t = listing.value.transfer?.type
  if (!t) return '-'
  if (t === '지정') return listing.value.transfer?.date || '협의'
  return t
})

function toPyeong(m2) { const n = Number(m2); if (!Number.isFinite(n)) return '-'; return (n / 3.305785).toFixed(1) }
const floorText = computed(() => {
  const c = listing.value.floor?.current ?? '-'
  const t = listing.value.floor?.total ?? '-'
  return `${c}/${t}층`
})

/* 갤러리 인디케이터 */
function onGalleryScroll() {
  const el = galleryRef.value
  if (!el) return
  const idx = Math.round(el.scrollLeft / el.clientWidth) + 1
  currentSlide.value = Math.min(Math.max(idx, 1), images.value.length)
}
onMounted(() => onGalleryScroll())

const descriptionParas = computed(() =>
  (listing.value.description || '')
    .split(/\n\s*\n/g)
    .map(s => s.trim())
    .filter(Boolean)
)

/* 액션 */
async function copyAddress() {
  try { await navigator.clipboard.writeText(listing.value.address || ''); alert('주소를 복사하였습니다.') }
  catch { alert('오류가 발생하였습니다. 다시 시도해주세요.') }
}
function share() {
  if (navigator.share) {
    navigator.share({
      title: listing.value.storeName || '매물 상세',
      text: `${listing.value.industry} · ${mainPriceLine.value}`,
      url: location.href
    }).catch(() => {})
  } else {
    alert('공유 기능을 지원하지 않는 브라우저입니다.')
  }
}
function contact() { alert('1:1 채팅으로 연결합니다.') }
</script>

<style scoped>
.detail-page {
  padding-bottom: 0;
  background: var(--color-white);
}

/* Gallery */
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

/* Sections */
.section {
  padding: 16px;
}
.head {
  padding-top: 12px;
}
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

/* Headline / Store name */
.price-headline {
  margin: 4px 0 6px;
  color: var(--color-black);
}
.store-name {
  color: var(--color-darkgray);
  margin-bottom: 10px;
}

/* Stat balls */
.price-block {
  border: none;
  background: transparent;
  padding: 8px 0;
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

/* Spec table */
.facts {
  padding-top: 8px;
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

/* Chips */
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--color-primary-10);
  color: var(--color-primary);
}

/* Location */
.location .loc-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.address {
  color: var(--color-black);
  margin-bottom: 8px;
}
.map {
  height: 180px;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-darkgray);
}

/* Description */
.description h2 {
  margin-bottom: 8px;
}
.desc-card {
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
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

/* CTA */
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
