import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useKakao } from 'vue3-kakao-maps'
import axios from 'axios'

const KAKAO_JS_KEY = (import.meta.env.VITE_KAKAO_JS_KEY || '').trim()

// axios 전역 기본값만 (프록시 통해 백엔드 연동)
axios.defaults.baseURL = '/api'
axios.defaults.timeout = 10000

;(async () => {
  if (!KAKAO_JS_KEY) {
    console.warn('[Kakao] VITE_KAKAO_JS_KEY is missing.')
  } else {
    try {
      // services + clusterer 를 한 번에 로드
      await useKakao(KAKAO_JS_KEY, ['services', 'clusterer'])
      const ok = !!(window.kakao?.maps?.MarkerClusterer)
      console.log('[Kakao] SDK ready (services, clusterer). clusterer:', ok)
    } catch (e) {
      console.warn('[Kakao] SDK load failed:', e)
    }
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
})()
