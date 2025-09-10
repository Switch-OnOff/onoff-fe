<template>
  <div class="container">
    <div class="market-img"></div>
    <div class="market-info">
      <label class="bodyMedium14px market-name"
        >한담 해안도로 카페거리 카페 24평</label
      >
      <label class="bodyBold14px">매매 1억 2천</label>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.container {
  padding: 0.8rem;
  border-bottom: 0.5px solid var(--color-lightgray);
  display: flex;
  gap: 1rem;
  align-items: center;

  position: fixed;
  top: 60px;
  z-index: 100;

  width: 393px;

  background-color: #fff;
}

.market-img {
  width: 50px;
  height: 50px;
  background-color: black;
  border-radius: 10px;
}
.market-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.market-name {
  color: var(--color-darkgray);
}
</style>
