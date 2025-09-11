<template>
  <div class="page">
    <SimpleHeader title="지원/대출 - 결과" />

    <!-- 헤드 메시지 -->
    <TopMessage class="px" v-bind="topProps">
      <!-- caution일 때만 slot 내용 삽입 -->
      <template v-if="isCaution"> 몇가지 조건을 보완하면 </template>
    </TopMessage>
    <main class="content px">
      <!-- 아이콘/일러스트 -->
      <img :src="bulbImg" class="bulb" alt="result" />

      <div class="below-hero">
        <div v-if="isEligible" class="center-msg bodyMedium18px">
          바로 신청해보세요.
        </div>

        <ul v-else class="reasons">
          <li v-for="(r, i) in reasons" :key="i" class="reason">
            <span class="checkbox" aria-hidden="true"></span>
            <span class="text bodyMedium18px">{{ r }}</span>
          </li>
        </ul>
      </div>
    </main>

    <div class="cta-wrap px">
      <BottomCTA :label="ctaLabel" :reserve-bottom="8" @click="onPrimary">
        <template #below>
          <div class="cta-spacer"></div>
        </template>
      </BottomCTA>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import TopMessage from './components/TopMessage.vue';
import BottomCTA from './components/BottomCTA.vue';

import switchON from '@/assets/icons/financial/switchON.png';
import switchM from '@/assets/icons/financial/switchM.png';
import switchOFF from '@/assets/icons/financial/switchOFF.png';

const route = useRoute();
const router = useRouter();

// 쿼리 파라미터로 분기: eligible | ineligible | caution
const status = computed(() => route.query.status || 'caution');
const productName = computed(() => route.query.product || '지원/대출 상품');
// 노란불일 때 보완 개수(쿼리로 넘길 수 있음: ?missing=3)
const missingCount = computed(() => Number(route.query.missing || 3));

const isEligible = computed(() => status.value === 'eligible');
const isIneligible = computed(() => status.value === 'ineligible');
const isCaution = computed(() => status.value === 'caution');

const bulbImg = computed(() => {
  if (isEligible.value) return switchON;
  if (isIneligible.value) return switchOFF;
  return switchM;
});

const topProps = computed(() => {
  if (isEligible.value) {
    return {
      prefix: '사용자 님은 ',
      highlight: productName.value,
      suffix: ' 지원 대상에 적합해요',
    };
  }
  if (isIneligible.value) {
    return {
      prefix: '스위치 님은 ',
      highlight: productName.value,
      suffix: ' 지원 대상이 아니에요',
    };
  }
  // caution
  return {
    prefix: '사용자 님은 ',
    highlight: productName.value,
    suffix: ' 지원 대상이 될 수 있어요',
  };
});

// 조언/체크리스트: 쿼리로 커스터마이즈 가능 (?reasons=a,b,c)
const reasons = computed(() => {
  const raw = route.query.reasons;
  if (typeof raw === 'string' && raw.trim()) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6); // 안전상 최대 6개 제한
  }
  if (isIneligible.value) {
    return [
      '요건을 더 충족해야 합니다',
      '담보/소득 조건을 확인해 주세요',
      '필요 서류를 준비해 주세요',
    ];
  }
  if (isCaution.value) {
    return [
      '요건을 더 충족해야 합니다',
      '서류 준비가 미비해요.',
      '필요 서류를 준비해 주세요',
    ];
  }
  return [];
});

const ctaLabel = computed(() => {
  if (isEligible.value) return '신청 페이지로 이동';
  return '대출·지원금 목록 보기';
});

const onPrimary = () => {
  if (isEligible.value) {
    // 실제 신청 라우트로 교체
    router.push({
      path: '/financial/apply',
      query: { product: productName.value },
    });
  } else {
    goList();
  }
};

const goList = () => router.push('/financial/list');
</script>

<style scoped>
.px {
  padding-left: 2rem;
  padding-right: 2rem;
}

.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bulb {
  width: 15rem;
  display: block;
  margin: 0 5rem 2rem 5rem;
}

.hl {
  color: var(--color-primary);
  font-weight: 700;
}

.below-hero {
  width: 100%;
  margin-top: 2rem;
}

.center-msg {
  text-align: center;
  margin-top: 0.25rem;
}

/* 체크리스트 */
.reasons {
  width: 100%;
  margin: 0 0 0.5rem;
  list-style: none;
}
.reason {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.75rem 0;
}
.checkbox {
  width: 1.1rem;
  height: 1.1rem;
  flex: 0 0 1.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px; /* 첫 줄 기준 미세 보정치도 동일 */

  /* 체크박스 스타일 */
  box-sizing: border-box; /* 테두리 포함 정사각형 */
  border: 2px solid var(--color-lightgray);
  border-radius: 4px;
  background: #fff;
}
.cta-wrap {
  margin-top: auto; /* CTA를 맨 아래로 밀어내기 */
}
.cta-spacer {
  height: 1.185rem;
}
</style>
