import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 8000,
});

// (선택) 요청/응답 로깅 & 에러 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 백엔드 500이면 스웨거에서 500 떴던 그거일 확률 높음
    console.error('[API ERROR]', err?.response?.status, err?.response?.data);
    throw err;
  }
);

// 백엔드가 { success, code, message, data } 래핑하니까 편하게 까주는 헬퍼
export function unwrap(res) {
  // 일부 엔드포인트는 래핑 없이 바로 리턴하는 것도 있으니 안전하게 처리
  if (res?.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data;
  }
  return res.data;
}
