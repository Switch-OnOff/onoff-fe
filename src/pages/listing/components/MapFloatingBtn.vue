<template>
  <teleport to="body">
    <button
      class="fab"
      type="button"
      @click="$emit('click')"
      aria-label="매물 지도 열기"
    >
      <span class="fab-circle">
        <img :src="iconSrc" alt="" aria-hidden="true" />
      </span>
      <span class="fab-label bodyMedium12px">{{ label }}</span>
    </button>
  </teleport>
</template>

<script setup>
import pinIcon from '@/assets/icons/map/listing-pin.png'
defineEmits(['click'])
const props = defineProps({
  label: { type: String, default: '매물 지도' },
  iconSrc: { type: String, default: pinIcon },
})
</script>

<style scoped>
.fab{
  position: fixed;
  /* 기본: 모바일/일반 브라우저에서 우하단 16px */
  right: calc(16px + env(safe-area-inset-right, 0px));
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  z-index: 9999;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* 데스크톱 미리보기(가운데 393px 레일)일 때만 오른쪽 여백 보정
   --app-max-width / --app-x-pad이 없어도 393/16 기본값으로 동작 */
@media (min-width: 480px){
  .fab{
    right: calc(
      (100vw - var(--app-max-width, 393px)) / 2 + var(--app-x-pad, 16px)
    );
    bottom: calc(16px + var(--tabbar-height, 110px) + env(safe-area-inset-bottom, 0px));
  }
}

.fab:focus-visible{
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 12px;
}

.fab-circle{
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--color-primary-10);
  display: grid; place-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,.08);
}

.fab-circle img{ width: 22px; height: 22px; display:block; }

.fab-label{ line-height:1; color: var(--color-black); user-select:none; }
</style>
