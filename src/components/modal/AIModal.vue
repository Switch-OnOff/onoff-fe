<template>
  <teleport to="body">
    <div v-if="open" class="am-backdrop" @click.self="$emit('close')">
      <div
        class="am-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title || 'AI 이미지 분석 결과'"
      >
        <button
          class="am-x"
          type="button"
          aria-label="닫기"
          @click="$emit('close')"
        >
          ×
        </button>

        <div class="am-body">
          <h3 class="am-title titleExtra20px">
            {{ title || 'AI 이미지 분석 결과' }}
          </h3>

          <div class="am-msg" v-if="message">
            <!-- 비율 원형 뱃지: 첫 줄에서 치킨집 60%, 주점 40% 형태를 파싱 -->
            <div v-if="ratioItems.length" class="am-ratios">
              <div
                v-for="(it, i) in ratioItems"
                :key="`r-${i}`"
                class="am-ratio"
              >
                <div
                  class="am-ratio-circle"
                  role="img"
                  :aria-label="`${it.label} ${it.percent}%`"
                >
                  <span>{{ it.percent }}%</span>
                </div>
                <!-- 라벨을 원형 아래로 이동 + 2px 크게 -->
                <div class="am-ratio-label bodyMedium14px">{{ it.label }}</div>
              </div>
            </div>

            <!-- 나머지 상단 라인들: bodyMedium14px -->
            <p
              v-for="(line, i) in otherHeadLines"
              :key="`h-${i}`"
              class="bodyMedium14px am-line"
            >
              {{ line }}
            </p>

            <!-- 하단(줄글): bodyRegular14px, 좌측 정렬 -->
            <p v-if="lastLine" class="bodyRegular14px am-line am-last">
              {{ lastLine }}
            </p>
          </div>

          <slot />
        </div>

        <div class="am-actions">
          <button
            type="button"
            class="am-btn am-primary bodyMedium14px"
            @click="$emit('confirm')"
          >
            {{ confirmText || '확인' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '확인' },
});
defineEmits(['close', 'confirm']);

// 전체 메시지를 줄 단위로 나눔 (빈 줄 제거)
const lines = computed(() =>
  (props.message || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
);

// 마지막 줄(줄글)과 그 이전 줄들 분리
const lastLine = computed(() =>
  lines.value.length ? lines.value[lines.value.length - 1] : ''
);
const headLines = computed(() =>
  lines.value.length > 1 ? lines.value.slice(0, -1) : lines.value
);

// 첫 줄에서 "치킨집 60%, 주점 40%" 형태를 파싱해 라벨/퍼센트 추출
const ratioItems = computed(() => {
  if (!headLines.value.length) return [];
  const first = headLines.value[0];

  const tokens = first
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const items = [];
  for (const t of tokens) {
    const m = t.match(/^(.*?)\s*([0-9]{1,3})\s*%$/);
    if (m) {
      const label = m[1].trim();
      const percent = Number(m[2]);
      if (label && !Number.isNaN(percent)) {
        items.push({ label, percent });
      }
    }
  }
  return items;
});

// 비율을 원형으로 그렸다면 첫 줄은 출력하지 않고, 그 외 줄만 출력
const otherHeadLines = computed(() => {
  if (!headLines.value.length) return [];
  return ratioItems.value.length ? headLines.value.slice(1) : headLines.value;
});

watch(
  () => props.open,
  (v) => {
    document.documentElement.style.overflow = v ? 'hidden' : '';
  }
);
</script>

<style scoped>
.am-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 10000;
}
.am-modal {
  width: min(92vw, 380px);
  background: var(--color-white);
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
  padding: 16px 14px 12px;
  position: relative;
  animation: am-pop 0.12s ease-out;
}
@keyframes am-pop {
  from {
    transform: scale(0.98);
    opacity: 0.6;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.am-x {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-lightgray);
  background: var(--color-white);
  border-radius: 10px;
  cursor: pointer;
}

.am-body {
  padding: 14px 8px 4px;
  text-align: left;
}
.am-title {
  color: var(--color-black);
  margin: 0 0 18px 0;
}

.am-msg {
  color: var(--color-lightblack);
  margin: 0;
}
.am-line {
  margin: 0 0 10px;
}
.am-last {
  margin-top: 6px;
}

/* 원형 비율 UI */
.am-ratios {
  display: flex;
  justify-content: center; /* 두 개 원형 자체 중앙 정렬 */
  align-items: flex-start;
  gap: 16px;
  margin: 6px 0 14px;
}
.am-ratio {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 96px;
}
/* 원형: 배경 연한 컬러로 변경 + 크기 축소 */
.am-ratio-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary-10);
  color: var(--color-black);
  display: grid;
  place-items: center;
  font-weight: 700;
  line-height: 1;
  user-select: none;
}
/* 라벨: 원형 아래 + 2px 크게 (기준 14px → 16px 가정) */
.am-ratio-label {
  margin-top: 6px;
  text-align: center;
  line-height: 1.2;
  font-weight: 500;
  color: var(--color-black);
}

.am-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding-top: 10px;
}
.am-btn {
  height: 40px;
  border-radius: 10px;
  background: var(--color-white);
  color: var(--color-lightblack);
}
.am-primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}
</style>
