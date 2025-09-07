import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'

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
    console.warn('[Kakao] SDK not detected. Falling back to Web Share / copy.')
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

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
})()
