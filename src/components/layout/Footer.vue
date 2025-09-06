<template>
  <header class="navbar">
    <nav>
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        :class="{ active: isActive(item.path) }"
      >
        <div class="wrapper">
          <div class="nav-icon">
            <img :src="item.icon" />
          </div>
          <label>{{ item.label }}</label>
        </div>
      </RouterLink>
    </nav>
  </header>
</template>

<script setup>
import locationIcon from '@/assets/icons/location.png';
import chatIcon from '@/assets/icons/chat.png';
import homeIcon from '@/assets/icons/home.png';
import loanIcon from '@/assets/icons/bulb-active.png';
import userIcon from '@/assets/icons/user.png';
import { useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { path: '/map', label: '매물', icon: locationIcon },
  { path: '/chatting', label: '채팅', icon: chatIcon },
  { path: '/', label: '홈', icon: homeIcon },
  { path: '/loan', label: '대출·지원금', icon: loanIcon },
  { path: '/my-page', label: '내정보', icon: userIcon },
];

const isActive = (path) => route.path === path;
</script>

<style scoped>
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
}

nav {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.nav-link {
  color: #000;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

label {
  margin-top: 2px;

  font-size: 0.75rem;
}

.nav-link.active label {
  color: #0e0b80;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon > img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
