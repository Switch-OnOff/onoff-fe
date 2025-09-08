<!-- src/components/map/KakaoMapAddress.vue -->
<template>
  <div class="kmap">
    <!-- 위치 헤더 -->
    <div class="loc-head">
      <p class="loc-title bodyBold18px">{{ heading }}</p>

      <!-- 주소 + (한 줄일 때만) 복사 버튼 -->
      <div class="loc-address-wrap">
        <div
          ref="addrEl"
          class="loc-address bodyMedium16px"
          :title="address"
        >
          {{ address }}
        </div>
        <button
          v-if="showCopy && !addrMultiline"
          type="button"
          class="btn-copy inline"
          @click="copyAddress"
          aria-label="주소 복사"
        >
          <img class="copy-icon" :src="copyIconSrc" alt="" aria-hidden="true" />
        </button>
      </div>

      <!-- 주소가 여러 줄이면 오른쪽 끝에 복사 버튼 -->
      <button
        v-if="showCopy && addrMultiline"
        type="button"
        class="btn-copy edge"
        @click="copyAddress"
        aria-label="주소 복사"
      >
        <img class="copy-icon" :src="copyIconSrc" alt="" aria-hidden="true" />
      </button>
    </div>

    <!-- 지도 -->
    <div class="map-wrap">
      <KakaoMap
        :lat="lat"
        :lng="lng"
        :level="levelLocal"
        :draggable="true"
        :scrollwheel="true"
        @onLoadKakaoMap="onMapReady"
        :style="{ width: '100%', height: mapHeight }"
      >
        <KakaoMapMarker
          v-if="!error && !loading && hasAddress"
          :lat="lat"
          :lng="lng"
          :title="title || address"
        />
      </KakaoMap>

      <div v-if="loading || error" class="overlay">
        <span v-if="loading">지도를 불러오는 중…</span>
        <span v-else>지도를 불러오지 못했습니다.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount, computed } from 'vue'
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps'
import defaultCopyIcon from '@/assets/icons/copy.png'

const props = defineProps({
  address:  { type: String, required: true },   // 주소
  title:    { type: String, default: '' },      // 마커 title
  level:    { type: Number, default: 3 },       // 지도 레벨
  height:   { type: [String, Number], default: '180px' }, // 지도 높이
  heading:  { type: String, default: '위치' },  // 헤더 타이틀
  showCopy: { type: Boolean, default: true },   // 복사 버튼 표시 여부
  copyIconSrc: { type: String, default: defaultCopyIcon } // 복사 아이콘
})

const FALLBACK = { lat: 37.41639, lng: 126.88500 } // 광명역
const lat = ref(FALLBACK.lat)
const lng = ref(FALLBACK.lng)
const levelLocal = ref(props.level)

const loading = ref(true)
const error = ref(false)
const hasAddress = computed(() => !!(props.address && props.address.trim().length > 0))

let geocoder = null
let mapsReady = false

function onMapReady() {
  geocoder = new window.kakao.maps.services.Geocoder()
  mapsReady = true
  geocodeAddress() 
}

async function geocodeAddress() {
  loading.value = true
  error.value = false

  if (!mapsReady || !hasAddress.value) {
    // 주소 없으면 기본 위치만 세팅
    lat.value = FALLBACK.lat
    lng.value = FALLBACK.lng
    loading.value = false
    return
  }

  await nextTick()
  geocoder.addressSearch(props.address, (result, status) => {
    const { Status } = window.kakao.maps.services
    if (status !== Status.OK || !result?.length) {
      lat.value = FALLBACK.lat
      lng.value = FALLBACK.lng
      loading.value = false
      error.value = true
      return
    }
    const { x, y } = result[0]
    lat.value = parseFloat(y)
    lng.value = parseFloat(x)
    loading.value = false
    error.value = false
  })
}

/* 레벨/주소 변화 반영 */
watch(() => props.level, v => { levelLocal.value = v ?? 3 })
watch(() => props.address, () => { geocodeAddress() })

/* 주소 한 줄이면 인라인, 여러 줄이면 우측 별도 */
const addrEl = ref(null)
const addrMultiline = ref(false)
const mapHeight = computed(() => typeof props.height === 'number' ? `${props.height}px` : props.height)

function measureAddressLines() {
  const el = addrEl.value
  if (!el) return
  const cs = getComputedStyle(el)
  const lh = parseFloat(cs.lineHeight)
  addrMultiline.value = lh && !Number.isNaN(lh) ? el.scrollHeight > lh * 1.5 : false
}

async function remeasureSoon() {
  await nextTick()
  measureAddressLines()
}

onMounted(() => {
  remeasureSoon()
  window.addEventListener('resize', remeasureSoon)
  window.visualViewport?.addEventListener('resize', remeasureSoon)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', remeasureSoon)
  window.visualViewport?.removeEventListener('resize', remeasureSoon)
})
watch(() => props.address, remeasureSoon)

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(props.address || '')
    alert('주소를 복사하였습니다.')
  } catch {
    alert('오류가 발생하였습니다. 다시 시도해주세요.')
  }
}
</script>

<style scoped>
.kmap {
  display: block;
}

.loc-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  column-gap: 8px;
  align-items: start;
  margin-bottom: 12px;
  color: var(--color-primary);
}

.loc-title {
  color: var(--color-primary);
  background-color: var(--color-primary-10);
  padding: 4px;
  border-radius: 4px;
}

/* 주소 한 줄일 때 복사 버튼 */
.loc-address-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin-top: 2px;
}

.loc-address {
  color: var(--color-black);
  line-height: 1.5;
  word-break: keep-all;
  overflow-wrap: anywhere;
  white-space: normal;
}

.btn-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
}

.btn-copy.inline {
  padding: 0; 
}

.btn-copy.edge {
  align-self: start; 
}

.copy-icon {
  width: 18px;
  height: 18px;
  display: block;
}

/* 지도 */
.map-wrap {
  position: relative;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: var(--color-lightgray);
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-darkgray);
  background: linear-gradient(0deg, rgba(255, 255, 255, .75), rgba(255, 255, 255, .75));
}
</style>
