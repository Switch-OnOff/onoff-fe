<template>
  <div class="top-wrap">
    <h1 class="title bodyMedium20px">
      <!-- prefix -->
      <span v-if="prefix">{{ prefix }}</span>

      <!-- caution일 때만 slot에 조건문구가 들어감 -->
      <slot></slot>

      <!-- slot이 있으면 줄바꿈 추가 -->
      <br />

      <!-- highlight (ex. 새희망자금) -->
      <strong v-if="highlight" class="hl bodyBold24px">{{ highlight }}</strong>

      <!-- suffix -->
      <span v-if="suffix"> {{ suffix }}</span>
    </h1>
  </div>
</template>

<script setup>
defineProps({
  prefix: String,
  highlight: String,
  suffix: String,
});
</script>

<style scoped>
.top-wrap {
  padding-top: 4rem;
  padding-bottom: 2.5rem;
}

.title {
  line-height: 1.5;
  color: var(--color-black);
}

.hl {
  color: var(--color-primary);
  font-weight: 700;
}
</style>
