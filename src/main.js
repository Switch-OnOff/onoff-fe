// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

import { useKakao } from 'vue3-kakao-maps/@utils'

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

function waitKakao(maxWaitMs = 6000, intervalMs = 30) {
  return new Promise((resolve) => {
    const start = Date.now()
    const check = () => {
      if (window.Kakao) return resolve(true)
      if (Date.now() - start > maxWaitMs) return resolve(false)
      setTimeout(check, intervalMs)
    }
    check()
  })
}

async function initKakao() {
  const hasSDK = await waitKakao()
  if (!hasSDK) {
    console.warn('[Kakao] JS SDK not detected.')
    return
  }
  try {
    const { Kakao } = window
    if (!Kakao.isInitialized()) {
      if (!KAKAO_JS_KEY) {
        console.warn('[Kakao] VITE_KAKAO_JS_KEY is missing.')
        return
      }
      Kakao.init(KAKAO_JS_KEY)
      console.log('[Kakao] initialized:', Kakao.isInitialized())
    }
  } catch (e) {
    console.warn('[Kakao] init failed:', e)
  }
}


;(async () => {
  await initKakao()

  if (KAKAO_JS_KEY) {
    try {
      await useKakao(KAKAO_JS_KEY, ['services', 'clusterer'])
    } catch (e) {
      console.warn('[KakaoMap] SDK load failed:', e)
    }
  } else {
    console.warn('[KakaoMap] VITE_KAKAO_JS_KEY is missing. 지도 기능이 동작하지 않을 수 있습니다.')
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
})()
