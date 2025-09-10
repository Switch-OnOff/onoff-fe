<template>
  <footer class="navbar">
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
            <img
              :src="isActive(item.path) ? item.iconActive : item.icon"
              alt=""
            />
          </div>
          <label class="bodyRegular12px">{{ item.label }}</label>
        </div>
      </RouterLink>
    </nav>
  </footer>
</template>

<script setup>
import locationIcon from '@/assets/icons/footer/location.png';
import locationIconActive from '@/assets/icons/footer/location-active.png';
import chatIcon from '@/assets/icons/footer/chat.png';
import chatIconActive from '@/assets/icons/footer/chat-active.png';
import homeIcon from '@/assets/icons/footer/home.png';
import homeIconActive from '@/assets/icons/footer/home-active.png';
import loanIcon from '@/assets/icons/footer/bulb.png';
import loanIconActive from '@/assets/icons/footer/bulb-active.png';
import userIcon from '@/assets/icons/footer/user.png';
import userIconActive from '@/assets/icons/footer/user-active.png';
import { useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { path: '/', label: '홈', icon: homeIcon, iconActive: homeIconActive },
  {
    path: '/loan',
    label: '대출·지원금',
    icon: loanIcon,
    iconActive: loanIconActive,
  },
  {
    path: '/listing',
    label: '매물',
    icon: locationIcon,
    iconActive: locationIconActive,
  },
  {
    path: '/chat-list',
    label: '채팅',
    icon: chatIcon,
    iconActive: chatIconActive,
  },
  {
    path: '/my-page',
    label: '내정보',
    icon: userIcon,
    iconActive: userIconActive,
  },
];

const isActive = (path) => route.path === path;
</script>

<style scoped>
.navbar {
  width: 100%;
  max-width: 393px;
  height: 64px;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--color-lightgray);

  position: fixed;
  bottom: 0;
  z-index: 1000;
}

nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 1rem;

  width: 100%;
}

.nav-link {
  color: #000;
  -webkit-tap-highlight-color: transparent;
}

label {
  margin-top: 2px;
  color: var(--color-mediumgray);
}

.nav-link.active label {
  color: var(--color-primary);
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
