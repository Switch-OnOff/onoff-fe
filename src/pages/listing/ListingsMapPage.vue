<!-- src/pages/listing/ListingsMapPage.vue -->
<template>
  <div class="map-page">
    <SimpleHeader title="양도 매물 지도" />

    <div class="map-wrap">
      <!-- Kakao Map -->
      <div ref="mapEl" class="map-root"></div>

      <!-- 플로팅 컨트롤 (바텀시트 열리면 숨김) -->
      <FloatingButtonStack
        v-if="!isBottomSheetOpen"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @move-current-location="moveToCurrentLocation"
      />

      <!-- 클러스터 바텀시트 -->
      <ClusterSheet
        :open="isBottomSheetOpen"
        :items="clusterItems"
        title="이 지역 매물"
        @close="closeClusterSheet"
        @select="goDetail"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createApp } from 'vue';
import axios from 'axios';

import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import FloatingButtonStack from '@/pages/listing/components/FloatingButtonStack.vue';
import ListingMiniCard from '@/pages/listing/components/ListingMiniCard.vue';
import ClusterSheet from '@/pages/listing/components/ClusterSheet.vue';
import routerInstance from '@/router';
import pinImgUrl from '@/assets/icons/map/listing-pin (1).png';
import fallbackThumb from '@/assets/images/fallback-image.png';

/** 지도/클러스터 옵션 */
const MAX_ZOOM_OUT_LEVEL = 12;
const CLUSTER_MIN_LEVEL = 5;
const LOCK_INIT_VIEW = true;

const route = useRoute();
const router = useRouter();

/** 라우터 쿼리 기반 초기 중심/줌 */
const initialCenter = (route.query.center &&
  route.query.center.split(',').map(Number)) || [37.497976, 127.027636];

const lat = ref(initialCenter[0]);
const lng = ref(initialCenter[1]);
const level = ref(Number(route.query.zoomLevel) || 5);

/** 쿼리에 view 정보가 있으면 복구 모드 */
const hasQueryView = !!(route.query.center && route.query.zoomLevel);

/** 상태 */
const listings = ref([]); // 지도에 올릴 매물(전체)
const propertyLocations = ref([]); // 지도에 올릴 매물 위치 데이터
const selected = ref(null); // 미니카드(오버레이) 선택 상태
const isBottomSheetOpen = ref(false); // 바텀시트 열림 여부
const clusterItems = ref([]); // 해당 클러스터에 포함된 매물 목록

/** 지도 핸들 */
const mapEl = ref(null);
let map = null;
let clusterer = null;
let markers = [];
let markerImage = null;
let overlay = null;
let overlayApp = null;

const pinSrc = pinImgUrl;

/* Kakao Maps 로딩 대기 */
function isMapsReady() {
  const w = window;
  return !!(
    w.kakao &&
    w.kakao.maps &&
    typeof w.kakao.maps.LatLng === 'function'
  );
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
async function waitKakaoMapsReady(maxMs = 7000, step = 50) {
  const start = Date.now();
  while (!isMapsReady()) {
    if (Date.now() - start > maxMs)
      throw new Error('Kakao Maps not ready in time');
    await sleep(step);
  }
}

/* Kakao Cluster 로딩 대기 */
const hasClusterer = () =>
  !!(window.kakao && window.kakao.maps && window.kakao.maps.MarkerClusterer);

async function waitClustererReady(maxMs = 7000, step = 50) {
  const start = Date.now();
  while (!hasClusterer()) {
    if (Date.now() - start > maxMs)
      throw new Error('Clusterer not ready in time');
    await sleep(step);
  }
}

/* 백엔드 데이터를 가지고 지도/카드 모델로 매핑 */
function mapServerRow(r) {
  const isSale = r.transactionType === '매매' || r.transactionType === 'SALE';
  return {
    id: r.id,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    thumbnail: r.images?.[0] || fallbackThumb,

    transactionType: isSale ? 'SALE' : 'MONTHLY',

    // ⬇ 매매면 월세/보증금 필드는 아예 undefined 로 (0 금지)
    salePrice: isSale ? r.salePrice ?? null : undefined,
    deposit: !isSale ? r.deposit ?? null : undefined,
    rent: !isSale ? r.rent ?? null : undefined,

    address: r.address,
    industry: r.industry,
    premium: r.premium ?? null,
    mgmtFee: r.mgmtFee ?? null,
    exclusiveArea: r.exclusiveArea ?? null,
  };
}

/* 서버에서 목록 로드 */
async function fetchListings() {
  try {
    const res = await axios.get('http://localhost:8080/api/property/card_list');
    const list = res?.data?.data;
    listings.value = Array.isArray(list) ? list : [];

    console.log('확인', listings.value);
    rebuildMarkers();

    if (hasQueryView) {
      const w = window;
      map.setCenter(new w.kakao.maps.LatLng(lat.value, lng.value));
      map.setLevel(Math.min(level.value, MAX_ZOOM_OUT_LEVEL));
    } else if (!LOCK_INIT_VIEW) {
      fitToBounds();
      if (map.getLevel() < CLUSTER_MIN_LEVEL + 1)
        map.setLevel(CLUSTER_MIN_LEVEL + 1);
    }
  } catch (e) {
    console.error('[Map fetchListings] failed:', e);
    alert('지도를 불러오지 못했습니다.');
  }
}

/*지도 위치 데이터 로드*/
async function fetchLocationData() {
  try {
    const res = await axios.get(
      'http://localhost:8080/api/property/property_location'
    );
    const list = res?.data?.data;
    propertyLocations.value = Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('[Map fetchLocationData] failed:', e);
    alert('매물 위치 데이터를 불러오지 못했습니다.');
  }
}

async function fetchCardByLocationId(locationId) {
  try {
    const res = await axios.get(
      `http://localhost:8080/api/property/card_list/${locationId}`
    );
    const raw = res?.data?.data;
    if (!raw) return null;

    return mapServerRow(raw);
  } catch (e) {
    console.error('[fetchCardByLocationId] failed:', e);
    return null;
  }
}

/* 맵 초기화 */
onMounted(async () => {
  try {
    await waitKakaoMapsReady();
    await waitClustererReady();

    const w = window;
    if (!mapEl.value) return;

    map = new w.kakao.maps.Map(mapEl.value, {
      center: new w.kakao.maps.LatLng(lat.value, lng.value),
      level: Math.min(level.value, MAX_ZOOM_OUT_LEVEL),
    });

    markerImage = new w.kakao.maps.MarkerImage(
      pinSrc,
      new w.kakao.maps.Size(36, 36),
      { offset: new w.kakao.maps.Point(18, 36) }
    );

    clusterer = new w.kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: CLUSTER_MIN_LEVEL,
      minClusterSize: 1,
      disableClickZoom: true,
      styles: [
        {
          width: '44px',
          height: '44px',
          background: 'var(--color-primary-80)',
          color: 'var(--color-white)',
          borderRadius: '12px',
          textAlign: 'center',
          lineHeight: '40px',
          border: '2px solid var(--color-white)',
          fontFamily: "'Pretendard', sans-serif",
          fontWeight: 700,
          fontSize: '16px',
        },
      ],
    });

    // 클러스터 클릭하면 바텀시트 열기
    w.kakao.maps.event.addListener(
      clusterer,
      'clusterclick',
      async (cluster) => {
        const ms = cluster.getMarkers();
        const ids = ms.map((m) => m.__item?.id).filter(Boolean);

        try {
          const results = await Promise.all(
            ids.map((id) => fetchCardByLocationId(id))
          );
          clusterItems.value = results.filter(Boolean);
        } catch (e) {
          console.error('[clusterclick] load cards failed:', e);
          clusterItems.value = [];
        }

        isBottomSheetOpen.value = true;
        closeOverlay();
      }
    );

    await fetchLocationData();
    await fetchListings();

    w.kakao.maps.event.addListener(map, 'dragend', () => updateURL());
    w.kakao.maps.event.addListener(map, 'zoom_changed', () => {
      const cur = map.getLevel();
      if (cur > MAX_ZOOM_OUT_LEVEL) {
        map.setLevel(MAX_ZOOM_OUT_LEVEL);
        level.value = MAX_ZOOM_OUT_LEVEL;
        return;
      }
      updateURL();
    });
  } catch (e) {
    console.error('[Map init failed]', e);
    alert('지도를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  }
});

/* 마커/클러스터 */
function rebuildMarkers() {
  const w = window;
  if (!map || !w.kakao || !w.kakao.maps) return;

  closeOverlay();

  if (clusterer) {
    try {
      clusterer.removeMarkers(markers);
    } catch {}
  } else {
    markers.forEach((m) => m.setMap && m.setMap(null));
  }
  markers = [];

  markers = propertyLocations.value.map((item) => {
    const m = new w.kakao.maps.Marker({
      position: new w.kakao.maps.LatLng(+item.lat, +item.lng),
      image: markerImage,
      clickable: true,
    });

    w.kakao.maps.event.addListener(m, 'click', async () => {
      try {
        const card = await fetchCardByLocationId(item.id);
        if (!card) {
          alert('이 위치에 연결된 매물을 찾지 못했습니다.');
          return;
        }
        openOverlay(card, m);
      } catch (e) {
        console.error('[marker click] failed:', e);
        alert('카드 데이터를 불러오지 못했습니다.');
      }
    });

    m.__item = item;
    return m;
  });

  if (clusterer) {
    clusterer.addMarkers(markers);
  } else {
    markers.forEach((m) => m.setMap && m.setMap(map));
  }
}

function fitToBounds() {
  const w = window;
  if (!map || listings.value.length === 0) return;
  const b = new w.kakao.maps.LatLngBounds();
  listings.value.forEach((it) =>
    b.extend(new w.kakao.maps.LatLng(it.lat, it.lng))
  );
  map.setBounds(b, 24, 24, 24, 24);
  if (map.getLevel() > MAX_ZOOM_OUT_LEVEL) {
    map.setLevel(MAX_ZOOM_OUT_LEVEL);
    level.value = MAX_ZOOM_OUT_LEVEL;
  }
}

function openOverlay(item, marker) {
  const w = window;
  if (!map || !w.kakao || !w.kakao.maps) return;

  closeOverlay();

  const container = document.createElement('div');
  container.className = 'overlay-container';
  const app = createApp(ListingMiniCard, { item, onClose: closeOverlay });
  app.use(routerInstance);
  app.mount(container);

  overlay = new w.kakao.maps.CustomOverlay({
    map,
    position: marker.getPosition(),
    content: container,
    xAnchor: 0.5,
    yAnchor: 1.05,
    zIndex: 9999,
  });
  overlayApp = app;
  selected.value = item;
}
function closeOverlay() {
  if (overlay) {
    overlay.setMap(null);
    overlay = null;
  }
  if (overlayApp) {
    overlayApp.unmount();
    overlayApp = null;
  }
  selected.value = null;
}

/* 바텀시트 제어 + 상세 이동 */
function closeClusterSheet() {
  isBottomSheetOpen.value = false;
  clusterItems.value = [];
}
function goDetail(id) {
  closeClusterSheet();
  router.push({ name: 'listing-detail', params: { id } });
}

/* URL 쿼리에 현재 뷰 반영 (센터/레벨 기억) */
function updateURL() {
  const c = map.getCenter(),
    z = map.getLevel();
  router.replace({
    query: {
      ...route.query,
      center: `${c.getLat()},${c.getLng()}`,
      zoomLevel: z,
    },
  });
  lat.value = c.getLat();
  lng.value = c.getLng();
  level.value = z;
}

function zoomIn() {
  if (map) map.setLevel(map.getLevel() - 1);
}
function zoomOut() {
  if (map) {
    const n = map.getLevel() + 1;
    if (n <= MAX_ZOOM_OUT_LEVEL) map.setLevel(n);
  }
}
function moveToCurrentLocation() {
  const w = window;
  if (!navigator.geolocation || !map || !w.kakao || !w.kakao.maps) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const center = new w.kakao.maps.LatLng(
        pos.coords.latitude,
        pos.coords.longitude
      );
      map.setCenter(center);
      map.setLevel(3);
      lat.value = pos.coords.latitude;
      lng.value = pos.coords.longitude;
      updateURL();
    },
    () => alert('현재 위치를 가져올 수 없습니다.')
  );
}

/* 정리 */
onBeforeUnmount(() => {
  closeOverlay();
  try {
    clusterer && clusterer.removeMarkers && clusterer.removeMarkers(markers);
  } catch {}
  try {
    clusterer && clusterer.setMap && clusterer.setMap(null);
  } catch {}
  markers.forEach((m) => m.setMap && m.setMap(null));
  markers = [];
  clusterer = null;
  markerImage = null;
  map = null;
});
</script>

<style scoped>
.map-wrap {
  position: relative;
  width: 100%;
  height: calc(100dvh - var(--header-h, 60px) - var(--footer-h, 64px));
  min-height: 420px;
  overscroll-behavior: contain;
  touch-action: none;
}
@supports not (height: 100dvh) {
  .map-wrap {
    height: calc(100vh - var(--header-h, 60px) - var(--footer-h, 64px));
  }
}
.map-root {
  width: 100%;
  height: 100%;
}

.overlay-container {
  pointer-events: auto;
  touch-action: auto;
}
</style>
