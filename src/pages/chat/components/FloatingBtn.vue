<template>
  <div class="btn" @click="$emit('click')">
    <img src="@/assets/icons/chat/down.png" />
  </div>
</template>

<script setup>
defineEmits(['click']);
</script>

<style scoped>
.btn {
  width: 50px;
  height: 50px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.25);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;

  position: absolute;
  bottom: 1rem;
  right: 1rem;
  z-index: 1000;
  cursor: pointer;
}

.btn img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>
