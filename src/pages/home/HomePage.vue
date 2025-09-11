<template>
  <div class="home-page">
    <section class="welcome">
      <div class="tab-box">
        <!-- <button
          class="tab-btn"
          :class="{ active: activeTab === 'give' }"
          @click="activeTab = 'give'"
        >
          양도할게용
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'take' }"
          @click="activeTab = 'take'"
        >
          승계할게요오옹
        </button> -->
      </div>

      <!-- 탭 내용 -->
      <div class="tab-content">
        <div v-if="activeTab === 'give'">
          <h3>양도할 분들을 위한 안내</h3>
          <p>가게를 양도하고 싶으신가요? 필요한 절차와 정보를 확인하세요.</p>
        </div>
        <div v-else-if="activeTab === 'take'">
          <h3>승계할 분들을 위한 안내</h3>
          <p>가게를 승계하려는 분들을 위한 매물 정보와 팁을 확인하세요.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import SegmentedBtn from '@/components/common/SegmentedBtn.vue';
import { ref } from 'vue';

const activeTab = ref('give'); // 기본 탭
</script>

<style scoped>
.home-page {
  padding: 16px;
}

.welcome {
  text-align: center;
  margin-top: 40px;
}

.btn-wrapper {
  border: 1px solid var(--color-darkgray);
  padding: 5px;
  border-radius: 5rem;
}

.option-btn {
  border-style: none !important;
}

/* 탭 버튼 영역 */
.tab-box {
  display: flex;
  justify-content: center;
  gap: 10px;
  border-bottom: 2px solid var(--color-light, #eee);
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  color: var(--color-primary, #0e0b80);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  border-bottom: 3px solid var(--color-primary, #0e0b80);
  color: var(--color-primary, #0e0b80);
}

/* 탭 내용 */
.tab-content {
  padding: 16px;
  background: var(--color-light, #f9f9f9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: left;
}
</style>
