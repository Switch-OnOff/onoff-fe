<template>
  <transition>
    <main><RouterView /></main>
  </transition>
  <Navbar />
</template>

<script setup>
import Navbar from './components/layout/Navbar.vue';
</script>

<style scoped></style>
