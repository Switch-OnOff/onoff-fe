<template>
  <div class="top-wrap">
    <h1 class="title bodyMedium20px">
      <span v-if="prefix">{{ prefix }}</span>
      <br />
      <strong v-if="highlight" class="hl bodyBold24px">{{ highlight }}</strong>
      <span v-if="suffix">{{ suffix }}</span>
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
  padding-top: 5rem;
  padding-bottom: 2.5rem;
}
.title {
  line-height: 1.5;
  color: var(--color-black);
}
.hl {
  color: var(--color-primary);
}
</style>
