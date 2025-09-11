<template>
  <div class="item" @click="$emit('click')">
    <div
      :class="['thumb', store.mode === 'support' ? 'is-gov' : '']"
      aria-hidden="true"
    >
      <img v-if="logoSrc" :src="logoSrc" :alt="title" class="thumb-img" />
      <div v-else class="thumb-fallback">…</div>
    </div>
    <div class="meta">
      <div class="title">{{ title }}</div>
      <div class="desc">{{ desc }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFinancialStore } from '@/stores/financial';

const props = defineProps({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  item: { type: Object, default: () => ({}) },
});

const store = useFinancialStore();

// 1) 로고 폴더 전체 불러오기 (eager + url)
const logoFiles = import.meta.glob('@/assets/icons/financial/logo/*', {
  eager: true,
  as: 'url',
});
const logoByName = {};
for (const path in logoFiles) {
  const file = path.split('/').pop(); // ex) "KB.png"
  logoByName[file] = logoFiles[path];
}

// 2) 키워드 → 파일명 매핑
const logoMap = {
  롯데: '롯데.png',
  리딩: '리딩.png',
  메리츠: '메리츠.png',
  볼보: '볼보.png',
  산은: '산은.png',
  아이엠: '아이엠.png',
  애큐온: '애큐온.png',
  오릭스: '오릭스.png',
  우리: '우리.png',
  코스모: '코스모.png',
  트라톤: '트라톤.png',
  하나: '하나.png',
  한국캐피탈: '한국캐피탈.png',
  한국투자: '한국투자캐피탈.png',
  현대: '현대.png',
  BMW: 'BMW.png',
  BNK: 'BNK.png',
  JB우리: 'JB우리캐피탈.png',
  KB: 'KB.png',
};

const logoSrc = computed(() => {
  if (store.mode === 'support') {
    // 지원금은 무조건 gov
    return logoByName['logo_gov.png'] || null;
  }

  if (store.mode === 'loan' && props.item?.loanCompany) {
    const company = props.item.loanCompany;
    const key = Object.keys(logoMap).find((k) => company.includes(k));
    if (key) return logoByName[logoMap[key]] || null;
  }

  return null; // fallback
});
</script>

<style scoped>
.item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
}

/* 고정 크기 + 원형 컨테이너 */
.thumb {
  flex-shrink: 0;
  width: 40px; /* ← 통일 */
  height: 40px;
  border-radius: 9999px;
  background: #fff; /* 흰 배경 */
  border: 1px solid #e8e8e8; /* 경계선 살짝 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* PNG 여백 튀는 거 방지 */
}

/* 로고 실제 크기: 컨테이너의 80% */
.thumb-img {
  width: 80%;
  height: 80%;
  object-fit: contain; /* 비율 유지 */
  image-rendering: -webkit-optimize-contrast;
}

/* gov 마크는 시각적으로 커 보여서 살짝 더 축소 */
.thumb.is-gov .thumb-img {
  width: 72%;
  height: 72%;
}

.thumb-fallback {
  font-size: 18px;
  color: #888;
}

.meta {
  flex: 1;
  min-width: 0;
}
.title {
  font-weight: 700;
  font-size: 14px;
  line-height: 1.4;
  word-break: keep-all;
}
.desc {
  font-size: 12px;
  color: var(--color-darkgray);
  margin-top: 2px;
  line-height: 1.3;
  word-break: keep-all;
}
</style>
