<template>
  <div class="item" @click="$emit('click')">
    <div class="thumb" aria-hidden="true"></div>
    <div class="meta">
      <div class="title">{{ title }}</div>
      <div class="desc">{{ desc }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  desc: string;
}>();
</script>

<style scoped>
.item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
}
.thumb {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  background: #eee;
}
.title {
  font-weight: 700;
}
.desc {
  font-size: 12px;
  color: var(--color-darkgray);
}
</style>
