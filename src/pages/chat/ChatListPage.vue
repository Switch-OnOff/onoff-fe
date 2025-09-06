<template>
  <SimpleHeader :title="title" :show-button="false" />
  <div class="home-page">
    <section class="welcome">
      <h1 class="titleExtra24px">채팅 리스트 페이지</h1>
      <p class="bodyRegular16px">여기는 채팅 리스트 화면이야.</p>
    </section>
  </div>
</template>

<script setup>
import SimpleHeader from '@/components/layout/SimpleHeader.vue';

const title = '채팅';
</script>

<style scoped>
.home-page {
  padding: 16px;
}

.welcome {
  text-align: center;
  margin-top: 40px;
}
</style>
