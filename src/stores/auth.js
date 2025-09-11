// stores/auth.js
import { defineStore } from 'pinia';

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    // 프론트 전용 사용자 캐시(선택). 서버 호출 없이 JWT 페이로드를 반영.
    user: null, // { id, email, name, ... } 형태로 프론트에서만 쓰는 캐시
  }),
  getters: {
    isAuthed: (s) => !!s.token,
    userId: (s) => {
      if (s.user?.id) return s.user.id;
      const payload = parseJwt(s.token);
      // 백엔드가 어떤 클레임을 쓰는지에 맞춰 우선순위 지정
      return payload?.sub ?? payload?.userId ?? payload?.uid ?? null;
    },
    // 필요하면 다른 클레임들도 노출
    username: (s) => {
      const p = parseJwt(s.token);
      return s.user?.name ?? p?.name ?? p?.preferred_username ?? null;
    },
  },
  actions: {
    restore() {
      const t = localStorage.getItem('accessToken') || '';
      this.token = t;
      // 선택: 부팅 시 JWT에서 user 캐시 갱신
      const p = parseJwt(t);
      if (p) {
        this.user = {
          id: p.sub ?? p.userId ?? p.uid ?? null,
          name: p.name ?? p.preferred_username ?? null,
          email: p.email ?? null,
        };
      } else {
        this.user = null;
      }
    },
    setToken(t) {
      this.token = t;
      localStorage.setItem('accessToken', t);
      // 선택: 토큰 설정 시점에 user 캐시 갱신
      const p = parseJwt(t);
      this.user = p
        ? {
            id: p.sub ?? p.userId ?? p.uid ?? null,
            name: p.name ?? p.preferred_username ?? null,
            email: p.email ?? null,
          }
        : null;
    },
    signOut() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('me'); // 혹시 이전에 저장했다면 같이 정리
    },
  },
});
