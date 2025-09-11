<template>
  <teleport to="body">
    <div v-if="open" class="am-backdrop" @click.self="$emit('close')">
      <div
        class="am-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title || '알림'"
      >
        <button class="am-x" type="button" aria-label="닫기" @click="$emit('close')">×</button>

        <div class="am-body">
          <!-- 아이콘 -->
          <svg class="am-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.08"/>
            <path d="M12 7v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
          </svg>

          <h3 class="am-title titleExtra20px">{{ title || '알림' }}</h3>
          <p class="am-msg bodyMedium14px" v-if="message">
            <span v-for="(line,i) in lines" :key="i">{{ line }}<br v-if="i<lines.length-1"/></span>
          </p>
          <slot />
        </div>

        <div class="am-actions">
          <button type="button" class="am-btn am-primary bodyMedium14px" @click="$emit('confirm')">
            {{ confirmText || '확인' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '확인' },
})
defineEmits(['close', 'confirm'])

const lines = computed(() => (props.message || '').split('\n'))

// 모달 열릴 때 바디 스크롤 락
watch(() => props.open, (v) => {
  const el = document.documentElement
  el.style.overflow = v ? 'hidden' : ''
})
</script>

<style scoped>
.am-backdrop{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.35);
  display: grid; place-items: center;
  z-index: 10000;
}

.am-modal{
  width: min(92vw, 380px);
  background: var(--color-white);
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(0,0,0,.18);
  padding: 16px 14px 12px;
  position: relative;
  animation: am-pop .12s ease-out;
}
@keyframes am-pop{ from{ transform: scale(.98); opacity:.6 } to{ transform: scale(1); opacity:1 } }

.am-x{
  position: absolute; top: 8px; right: 8px;
  width: 32px; height: 32px;
  border: 1px solid var(--color-lightgray);
  background: var(--color-white);
  border-radius: 10px;
  cursor: pointer;
}

.am-body{ padding: 14px 8px 4px; text-align: center; }
.am-icon{
  width: 44px; height: 44px; margin: 0 auto 8px;
  color: var(--color-primary);
}
.am-title{ color: var(--color-black); margin: 0 0 6px; }
.am-msg{ color: var(--color-lightblack); margin: 0; white-space: pre-line; }

.am-actions{
  display: grid; grid-template-columns: 1fr; gap: 8px;
  padding-top: 10px;
}
.am-btn{
  height: 40px; border-radius: 10px;
  background: var(--color-white); color: var(--color-lightblack);
}
.am-primary{
  background: var(--color-primary); border-color: var(--color-primary);
  color: var(--color-white);
}
</style>
