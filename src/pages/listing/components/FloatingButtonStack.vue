<!-- src/pages/listing/components/FloatingButtonStack.vue -->
<template>
  <div class="floating-btn-stack">
    <div class="custom-zoom-control titleExtra28px">
      <button type="button" aria-label="지도 확대" @click="$emit('zoom-in')">
        <img :src="plusIcon" alt="" class="icon" draggable="false" />
      </button>
      <button type="button" aria-label="지도 축소" @click="$emit('zoom-out')">
        <img :src="minusIcon" alt="" class="icon" draggable="false" />
      </button>
    </div>

    <button
      type="button"
      class="move-current-location-btn"
      title="현재 위치로 이동"
      aria-label="현재 위치로 이동"
      @click="onMoveClick"
      :aria-busy="loading ? 'true' : 'false'"
    >
      <img :src="gpsIcon" alt="" class="icon-gps" draggable="false" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import gpsIcon from '@/assets/icons/map/gps-map.png'
import plusIcon from '@/assets/icons/map/plus-map.png'
import minusIcon from '@/assets/icons/map/minus-map.png'

const emit = defineEmits(['zoom-in', 'zoom-out', 'move-current-location'])
const loading = ref(false)

function onMoveClick() {
  // 브라우저에서 위치 미지원이면 부모 핸들러에 위임
  if (!navigator.geolocation) {
    emit('move-current-location')
    return
  }

  loading.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      loading.value = false
      const { latitude, longitude, accuracy } = pos.coords
      emit('move-current-location', { lat: latitude, lng: longitude, accuracy })
    },
    () => {
      loading.value = false
      emit('move-current-location')
    },
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 8000 }
  )
}
</script>

<style scoped>
.floating-btn-stack {
  position: absolute;
  right: 24px;
  bottom: 50px;
  z-index: 110;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

/* 확대/축소 그룹 */
.custom-zoom-control {
  position: static;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-zoom-control button {
  width: 38px;
  height: 38px;
  background: var(--color-white);
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 8px var(--color-primary-10);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 현재 위치 버튼 */
.move-current-location-btn {
  position: static;
  width: 40px;
  height: 40px;
  background: var(--color-white);
  border-radius: 99px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px var(--color-primary-10);
  z-index: 102;
  -webkit-tap-highlight-color: transparent;
}

.move-current-location-btn[aria-busy="true"] {
  opacity: .75;
  cursor: progress;
}

.icon {
  width: 22px;
  height: 22px;
  padding: 3px;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

.icon-gps {
  width: 24px;
  height: 24px;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}
</style>
