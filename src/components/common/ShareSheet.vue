<!-- src/components/common/ShareSheet.vue -->
<template>
  <Transition name="fade" appear>
    <div
      v-if="open"
      class="sheet-wrap"
      role="dialog"
      aria-modal="true"
      @click.self="$emit('close')"
    >
      <Transition name="bottomsheet" appear>
        <div class="sheet" :style="sheetStyle">
          <div class="sheet-handle"></div>

          <div class="sheet-title">
            <img class="title-icon" :src="shareIcon" alt="공유" />
            <h3 class="bodySemiBold16px">공유하기</h3>
          </div>

          <div class="sheet-grid">
            <button type="button" class="action" @click="shareKakao">
              <img class="icon" :src="kakaoIcon" alt="카카오톡" />
              <span class="bodyMedium14px">카카오톡</span>
            </button>

            <button type="button" class="action" @click="shareSMS">
              <img class="icon" :src="messageIcon" alt="문자" />
              <span class="bodyMedium14px">문자</span>
            </button>

            <button type="button" class="action" @click="copyLink">
              <img class="icon" :src="linkIcon" alt="링크복사" />
              <span class="bodyMedium14px">링크복사</span>
            </button>

            <button type="button" class="action" @click="shareEmail">
              <img class="icon" :src="emailIcon" alt="이메일" />
              <span class="bodyMedium14px">이메일</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import shareIcon   from '@/assets/icons/share/share-icon.png'
import kakaoIcon   from '@/assets/icons/share/kakao-icon.png'
import messageIcon from '@/assets/icons/share/message-share.png'
import linkIcon    from '@/assets/icons/share/link-share.png'
import emailIcon   from '@/assets/icons/share/email-share.png'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  url: { type: String, default: '' },
  fitTo: { type: String, default: '.detail-page' },
  maxWidth: { type: [Number, String], default: 480 }
})

const containerWidth = ref(null)

function measure() {
  const el = props.fitTo ? document.querySelector(props.fitTo) : null
  if (el) {
    containerWidth.value = Math.round(el.getBoundingClientRect().width)
  } else {
    containerWidth.value = typeof props.maxWidth === 'number' ? props.maxWidth : undefined
  }
}

const sheetStyle = computed(() => {
  const w = containerWidth.value
  const fallback = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
  return { '--sheet-max-w': w ? `${w}px` : fallback || '480px' }
})

function onResize() {
  if (props.open) measure()
}

onMounted(() => {
  measure()
  window.addEventListener('resize', onResize)
  window.visualViewport?.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.visualViewport?.removeEventListener('resize', onResize)
})
watch(() => props.open, v => v && measure())

function toast(msg){ alert(msg) }

async function copyLink() {
  const url = props.url || location.href
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = url
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  toast('링크를 복사했어요.')
}

function shareSMS() {
  const u = props.url || location.href
  const body = encodeURIComponent(`${props.text}\n${u}`)
  location.href = `sms:?&body=${body}`
}

function shareEmail() {
  const subject = encodeURIComponent(props.title || '매물 상세')
  const body = encodeURIComponent(`${props.text}\n${props.url || location.href}`)
  location.href = `mailto:?subject=${subject}&body=${body}`
}

function shareKakao() {
  const Kakao = window.Kakao
  if (!Kakao || !Kakao.isInitialized?.()) {
    toast('카카오 공유를 사용할 수 없습니다.')
    return
  }
  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: props.title || '매물 상세',
      description: props.text || '',
      imageUrl: 'https://placehold.co/600x400?text=Listing',
      link: {
        mobileWebUrl: props.url || location.href,
        webUrl: props.url || location.href
      }
    },
    buttons: [
      {
        title: '자세히 보기',
        link: {
          mobileWebUrl: props.url || location.href,
          webUrl: props.url || location.href
        }
      }
    ]
  })
}
</script>

<style scoped>
.sheet-wrap {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, .35);
  backdrop-filter: saturate(120%) blur(2px);
}

.sheet {
  position: fixed;
  left: 50%;
  bottom: 0;
  width: min(100vw, var(--sheet-max-w, 480px));
  background: var(--color-white);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 12px 16px calc(14px + env(safe-area-inset-bottom, 0px));
  will-change: transform;
  transform: translate3d(-50%, 0, 0);
}

.sheet-handle {
  width: 46px;
  height: 4px;
  background: var(--color-lightgray);
  border-radius: 999px;
  margin: 4px auto 12px;
}

.sheet-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  margin: 8px 4px 12px;
  color: var(--color-black);
  border-bottom: 1px solid var(--color-lightgray);
}

.title-icon {
  width: 14px;
  height: 14px;
  display: block;
}

.sheet-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 10px;
  justify-items: center;
  padding: 8px 4px 16px 4px;
}

.action {
  width: 72px;
  height: 78px;
  border: 1px solid var(--color-lightgray);
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.action span {
  color: var(--color-primary);
}

.icon {
  width: 24px;
  height: 24px;
  display: block;
}

.fade-enter-from {
  opacity: 0;
}
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active {
  transition: opacity .22s ease;
}
.fade-leave-active {
  transition: opacity .22s ease;
}

/* 바텀시트 애니메이션 */
.bottomsheet-enter-active {
  animation: sheet-in .42s cubic-bezier(.2, .9, .2, 1) both;
}
.bottomsheet-leave-active {
  animation: sheet-out .24s cubic-bezier(.22, .61, .36, 1) both;
}
@keyframes sheet-in {
  0% {
    transform: translate3d(-50%, 120%, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}
@keyframes sheet-out {
  0% {
    transform: translate3d(-50%, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 120%, 0);
  }
}

.bottomsheet-enter-active .sheet-grid .action {
  opacity: 0;
  transform: translateY(10px);
  animation: item-in .24s ease-out both;
}
.bottomsheet-enter-active .sheet-grid .action:nth-child(1) { animation-delay: .06s; }
.bottomsheet-enter-active .sheet-grid .action:nth-child(2) { animation-delay: .10s; }
.bottomsheet-enter-active .sheet-grid .action:nth-child(3) { animation-delay: .14s; }
.bottomsheet-enter-active .sheet-grid .action:nth-child(4) { animation-delay: .18s; }

@keyframes item-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .bottomsheet-enter-active,
  .bottomsheet-leave-active {
    animation: none !important;
    transition: none !important;
  }
}
</style>
