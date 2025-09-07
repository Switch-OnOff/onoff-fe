<template>
  <div class="kmap">
    <div ref="el" class="canvas"></div>
    <div v-if="loading || error" class="overlay">
      <span v-if="loading">지도를 불러오는 중…</span>
      <span v-else>지도를 불러오지 못했습니다.</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { loadKakaoMaps } from '@/lib/kakaoMapsLoader'

const props = defineProps({
  address: { type: String, required: true },
  title:   { type: String, default: '' },
  level:   { type: Number, default: 3 },
  height:  { type: [String, Number], default: '180px' }
})

const el = ref(null)
const loading = ref(true)
const error = ref(false)

let kakao, map, marker, geocoder

async function ensureMap() {
  loading.value = true
  error.value = false
  try {
    kakao = await loadKakaoMaps()
    geocoder ||= new kakao.maps.services.Geocoder()

    await nextTick()
    if (!map) {
      map = new kakao.maps.Map(el.value, {
        center: new kakao.maps.LatLng(37.41639, 126.88500),  //광명역 기준
        level: props.level
      })
    } else {
      map.setLevel(props.level)
    }

    if (!props.address) {
      loading.value = false
      return
    }

    geocoder.addressSearch(props.address, (result, status) => {
      if (status !== kakao.maps.services.Status.OK || !result?.length) {
        const fallback = new kakao.maps.LatLng(37.41639, 126.88500)
        map.setCenter(fallback)
        loading.value = false
        error.value = true
        return
      }
      const { x, y } = result[0]
      const pos = new kakao.maps.LatLng(y, x)
      map.setCenter(pos)
      if (!marker) marker = new kakao.maps.Marker({ position: pos, title: props.title, map })
      else marker.setPosition(pos)
      map.relayout?.()
      loading.value = false
      error.value = false
    })
  } catch (e) {
    console.error('[KakaoMapAddress]', e)
    error.value = true
    loading.value = false
  }
}

onMounted(ensureMap)
watch(() => [props.address, props.level], ensureMap)
</script>

<style scoped>
.kmap {
  position: relative;
  height: v-bind('typeof height==="number" ? height + "px" : height');
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: #f7f8fa;
  overflow: hidden;
}
.canvas { width: 100%; height: 100%; }
.overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: var(--color-darkgray);
  background: linear-gradient(0deg, rgba(255,255,255,.75), rgba(255,255,255,.75));
}
</style>
