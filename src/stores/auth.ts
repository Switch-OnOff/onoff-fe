import { defineStore } from 'pinia';

type User = { id: string; name: string } | null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    user: null as User,
  }),
  actions: {
    restore() {
      const t = localStorage.getItem('accessToken') || '';
      this.token = t;
      // 필요하다면 여기서 사용자 정보도 복원
      // this.user = JSON.parse(localStorage.getItem('me') || 'null')
    },
    setToken(t: string) {
      this.token = t;
      localStorage.setItem('accessToken', t);
    },
    signOut() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('me');
    },
  },
});
