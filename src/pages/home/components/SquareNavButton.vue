<template>
  <button type="button" class="square-btn" @click="go" :aria-label="label">
    <div class="icon-wrap">
      <!-- 중앙 아이콘 슬롯 (흰 원 안) -->
      <slot name="icon">
        <!-- 아이콘 없을 때 자리 확보용 -->
        <span class="icon-placeholder" />
      </slot>
    </div>
    <span class="label bodyMedium16px">{{ label }}</span>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  label: { type: String, required: true },
  // 라우트 이름 또는 route location object
  to: { type: [String, Object], required: true },
})
const router = useRouter()
function go() {
  const dest = typeof props.to === 'string' ? { name: props.to } : props.to
  router.push(dest).catch(() => {})
}
</script>

<style scoped>
.square-btn {
  width: 164px;
  height: 140px;
  border-radius: 12px;
  /* color token fallback 처리 */
  background: var(--color-primary-05, var(--color-primary-10));
  display: flex;
  flex-direction: column;              /* 세로 배치: 아이콘 → 라벨 */
  align-items: center;                 /* 가로 중앙 */
  justify-content: center;             /* 세로 중앙 → 아이콘+텍스트 묶음이 박스 중앙 */
  gap: 8px;                           /* 아이콘-텍스트 간격 */
  text-align: center;
  padding: 12px;
  color: var(--color-primary);
  transition: var(--transition);
}
.square-btn:active { transform: scale(.98); }

/* 아이콘 컨테이너: 원형 흰 배경 */
.icon-wrap {
  display: flex; align-items: center; justify-content: center;
  width: 72px; height: 72px;                /* 원 크기 */
  background: var(--color-white);           /* 흰색 배경 */
  border-radius: 50%;                       /* 원형 */
}

/* 슬롯으로 들어오는 svg/img에 공통 사이즈 적용 (원 안에서 균형) */
.icon-wrap :deep(svg),
.icon-wrap :deep(img) {
  width: 44px; height: 44px;
  object-fit: contain;
  display: block;
}

/* 아이콘 없을 때 높이 유지용 */
.icon-placeholder { display: inline-block; width: 28px; height: 28px; }

.label { display: block; }
</style>
