import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    user: null,
  }),
  actions: {
    restore() {
      const t = localStorage.getItem('accessToken') || '';
      this.token = t;
      // 필요하다면 사용자 정보 복원
      // this.user = JSON.parse(localStorage.getItem('me') || 'null')
    },
    setToken(t) {
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
