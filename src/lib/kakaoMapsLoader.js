// Kakao Maps SDK를 탭당 1번만 로드
let kakaoPromise = null

export function loadKakaoMaps() {
  if (window.kakao?.maps) return Promise.resolve(window.kakao)
  if (kakaoPromise) return kakaoPromise

  const key = (
    import.meta.env.VITE_KAKAO_MAP_KEY ||
    import.meta.env.VITE_KAKAO_JS_KEY  ||
    ''
  ).trim()

  kakaoPromise = new Promise((resolve, reject) => {
    if (!key) return reject(new Error('Kakao JS key missing'))
    const url = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&libraries=services&autoload=false`

    const s = document.createElement('script')
    s.src = url
    s.async = true
    s.onload = () => {
      if (!window.kakao?.maps?.load) return reject(new Error('Kakao SDK loaded but maps not ready'))
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    s.onerror = () => reject(new Error('Failed to load Kakao Maps SDK'))
    document.head.appendChild(s)
  })

  return kakaoPromise
}
