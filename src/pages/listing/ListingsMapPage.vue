<!-- src/pages/listing/ListingsMapPage.vue -->
<template>
  <div class="map-page">
    <SimpleHeader title="양도 매물 지도" />

    <div class="map-wrap">
      <!-- 목데이터 컨트롤 -->
      <div v-if="DEV" class="dev-toolbar">
        <button @click="seedMocks(120)">Mock 120</button>
        <button @click="seedMocks(400)">Mock 400</button>
        <button @click="clearMocks()">Clear</button>
      </div>

      <!-- Kakao Map DOM -->
      <div ref="mapEl" class="map-root"></div>

      <!-- 플로팅 컨트롤 -->
      <FloatingButtonStack
        v-if="!isBottomSheetOpen"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @move-current-location="moveToCurrentLocation"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createApp } from 'vue'

import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import FloatingButtonStack from '@/pages/listing/components/FloatingButtonStack.vue'
import ListingMiniCard from '@/pages/listing/components/ListingMiniCard.vue'
import routerInstance from '@/router'
import pinImgUrl from '@/assets/icons/listing-pin.png'

/* 목데이터 유틸 (추후 삭제) */
const DEV = import.meta.env.DEV
const rnd = (min, max) => Math.random() * (max - min) + min
const m2lat = (m) => m / 111_111
const m2lng = (m, lat) => m / (111_111 * Math.cos((lat * Math.PI) / 180))

function mockListing(id, lat, lng) {
  const isSale = Math.random() < 0.35
  return {
    id,
    title: ['카페','분식','미용실','편의점','의류','베이커리'][id % 6] + ' ' + (100 + id),
    lat, lng,
    thumbnail: `https://picsum.photos/seed/listing${id}/240/160`,
    transactionType: isSale ? 'SALE' : 'MONTHLY',
    salePrice: isSale ? Math.round(rnd(1.5, 8) * 1e8) : undefined,
    deposit: !isSale ? Math.round(rnd(2, 8) * 1e7) : undefined,
    monthlyRent: !isSale ? Math.round(rnd(80, 350) * 1e4) : undefined,
    address: '서울 강남구 테스트로 ' + (10 + (id % 90)),
  }
}
function genMocks(n, lat0, lng0, radiusM = 2000) {
  const arr = []
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt(Math.random()) * radiusM
    const t = Math.random() * Math.PI * 2
    arr.push(
      mockListing(
        1000 + i,
        lat0 + m2lat(r * Math.cos(t)),
        lng0 + m2lng(r * Math.sin(t), lat0)
      )
    )
  }
  return arr
}

const MAX_ZOOM_OUT_LEVEL = 12
const CLUSTER_MIN_LEVEL  = 5

const route = useRoute()
const router = useRouter()

const initialCenter =
  (route.query.center && route.query.center.split(',').map(Number)) || [37.497976, 127.027636]

const lat = ref(initialCenter[0])
const lng = ref(initialCenter[1])
const level = ref(Number(route.query.zoomLevel) || 5)

const listings = ref(genMocks(120, lat.value, lng.value))
const selected = ref(null)
const isBottomSheetOpen = ref(false)

const mapEl = ref(null)
let map = null

let clusterer = null
let markers = []
let markerImage = null

let overlay = null
let overlayApp = null

const pinSrc = pinImgUrl

/* Kakao Maps 로딩 대기 */
function isMapsReady() {
  const w = window
  return !!(w.kakao && w.kakao.maps && typeof w.kakao.maps.LatLng === 'function')
}
function sleep(ms) { return new Promise(res => setTimeout(res, ms)) }
async function waitKakaoMapsReady(maxMs = 7000, step = 50) {
  const start = Date.now()
  while (!isMapsReady()) {
    if (Date.now() - start > maxMs) throw new Error('Kakao Maps not ready in time')
    await sleep(step)
  }
}
const hasClusterer = () => !!(window.kakao && window.kakao.maps && window.kakao.maps.MarkerClusterer)

/* 맵 준비 */
onMounted(async () => {
  try {
    await waitKakaoMapsReady() // SDK 완전 로드

    const w = window
    if (!mapEl.value) return

    map = new w.kakao.maps.Map(mapEl.value, {
      center: new w.kakao.maps.LatLng(lat.value, lng.value),
      level: Math.min(level.value, MAX_ZOOM_OUT_LEVEL),
    })

    console.log('[Cluster] available:', hasClusterer())

    markerImage = new w.kakao.maps.MarkerImage(
      pinSrc,
      new w.kakao.maps.Size(36, 36),
      { offset: new w.kakao.maps.Point(18, 36) }
    )

    if (hasClusterer()) {
      clusterer = new w.kakao.maps.MarkerClusterer({
        map,
        averageCenter: true,
        minLevel: CLUSTER_MIN_LEVEL,
        minClusterSize: 1,
        disableClickZoom: true,
        styles: [{
          width: '44px', height: '44px',
          background: 'var(--color-primary-80)',
          color: '#fff', borderRadius: '22px',
          textAlign: 'center', lineHeight: '44px',
          border: '2px solid #fff',
        }],
      })
    } else {
      console.warn('[Cluster] library NOT loaded → fallback to plain markers')
    }

    rebuildMarkers()
    fitToBounds()
    if (map.getLevel() < CLUSTER_MIN_LEVEL + 1) map.setLevel(CLUSTER_MIN_LEVEL + 1)

    w.kakao.maps.event.addListener(map, 'dragend', () => updateURL())
    w.kakao.maps.event.addListener(map, 'zoom_changed', () => {
      const cur = map.getLevel()
      if (cur > MAX_ZOOM_OUT_LEVEL) {
        map.setLevel(MAX_ZOOM_OUT_LEVEL)
        level.value = MAX_ZOOM_OUT_LEVEL
        return
      }
      updateURL()
    })
  } catch (e) {
    console.error('[Map init failed]', e)
    alert('지도를 불러오지 못했습니다. 잠시 후 다시 시도해줘.')
  }
})

/* 마커/클러스터 구성 */
function rebuildMarkers() {
  const w = window
  if (!map || !w.kakao || !w.kakao.maps) return

  closeOverlay()

  if (clusterer) {
    try { clusterer.removeMarkers(markers) } catch {}
  } else {
    markers.forEach(m => m.setMap && m.setMap(null))
  }
  markers = []

  markers = listings.value.map(item => {
    const m = new w.kakao.maps.Marker({
      position: new w.kakao.maps.LatLng(item.lat, item.lng),
      image: markerImage,
      clickable: true,
    })
    w.kakao.maps.event.addListener(m, 'click', () => openOverlay(item, m))
    return m
  })

  if (clusterer) {
    clusterer.addMarkers(markers)
    console.log('[Cluster] markers added:', markers.length, 'level=', map.getLevel())
  } else {
    markers.forEach(m => m.setMap && m.setMap(map))
    console.log('[Cluster] fallback markers added:', markers.length)
  }
}

function fitToBounds() {
  const w = window
  if (!map || listings.value.length === 0) return
  const b = new w.kakao.maps.LatLngBounds()
  listings.value.forEach(it => b.extend(new w.kakao.maps.LatLng(it.lat, it.lng)))
  map.setBounds(b, 24, 24, 24, 24)
  if (map.getLevel() > MAX_ZOOM_OUT_LEVEL) {
    map.setLevel(MAX_ZOOM_OUT_LEVEL)
    level.value = MAX_ZOOM_OUT_LEVEL
  }
}

/* 오버레이 */
function openOverlay(item, marker) {
  const w = window
  if (!map || !w.kakao || !w.kakao.maps) return

  closeOverlay()

  const container = document.createElement('div')
  container.className = 'overlay-container'
  overlayApp = createApp(ListingMiniCard, { item, onClose: closeOverlay })
  overlayApp.use(routerInstance)
  overlayApp.mount(container)

  overlay = new w.kakao.maps.CustomOverlay({
    map,
    position: marker.getPosition(),
    content: container,
    xAnchor: 0.5, yAnchor: 1.05,
    zIndex: 9999,
  })
  selected.value = item
}
function closeOverlay() {
  if (overlay) { overlay.setMap(null); overlay = null }
  if (overlayApp) { overlayApp.unmount(); overlayApp = null }
  selected.value = null
}

/* 컨트롤 */
function updateURL() {
  const c = map.getCenter(), z = map.getLevel()
  router.replace({ query: { ...route.query, center: `${c.getLat()},${c.getLng()}`, zoomLevel: z } })
  lat.value = c.getLat(); lng.value = c.getLng(); level.value = z
}
function zoomIn(){ if (map) map.setLevel(map.getLevel() - 1) }
function zoomOut(){ if (map) { const n = map.getLevel() + 1; if (n <= MAX_ZOOM_OUT_LEVEL) map.setLevel(n) } }
function moveToCurrentLocation(){
  const w = window
  if (!navigator.geolocation || !map || !w.kakao || !w.kakao.maps) return
  navigator.geolocation.getCurrentPosition(
    (pos)=>{
      const center = new w.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      map.setCenter(center); map.setLevel(3)
      lat.value = pos.coords.latitude; lng.value = pos.coords.longitude
      updateURL()
    },
    ()=>alert('현재 위치를 가져올 수 없습니다.')
  )
}

/* DEV 목데이터 (추후 삭제) */
function seedMocks(n = 120){
  listings.value = genMocks(n, lat.value, lng.value)
  rebuildMarkers()
  fitToBounds()
  if (map.getLevel() < CLUSTER_MIN_LEVEL + 1) map.setLevel(CLUSTER_MIN_LEVEL + 1)
}
function clearMocks(){
  listings.value = []
  rebuildMarkers()
}

/* 정리 */
onBeforeUnmount(() => {
  closeOverlay()
  try { clusterer && clusterer.removeMarkers && clusterer.removeMarkers(markers) } catch {}
  try { clusterer && clusterer.setMap && clusterer.setMap(null) } catch {}
  markers.forEach(m => m.setMap && m.setMap(null))
  markers = []
  clusterer = null
  markerImage = null
  map = null
})
</script>

<style scoped>
.map-wrap{
  position: relative;
  width: 100%;
  height: calc(100dvh - var(--header-h, 56px) - var(--footer-h, 56px));
  min-height: 420px;
  overscroll-behavior: contain;
  touch-action: none;
}
@supports not (height: 100dvh) {
  .map-wrap{ height: calc(100vh - var(--header-h, 56px) - var(--footer-h, 56px)); }
}
.map-root{ width:100%; height:100%; }

.dev-toolbar{
  position: absolute; left:10px; top:10px; z-index:1100;
  display:flex; gap:6px;
}
.dev-toolbar>button{
  padding:6px 10px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; font-size:12px;
}

.overlay-container{
  pointer-events:auto;
  touch-action:auto; 
}
</style>