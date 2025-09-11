<!-- src/pages/financial/SupportCriteriaPage.vue -->
<template>
  <div class="page">
    <SimpleHeader title="대출·지원금" />

    <TopMessage
      class="px"
      :prefix="'지원받기 위한'"
      :highlight="'선정 기준'"
      :suffix="' 충족 여부를 체크해주세요'"
    />

    <main class="content px">
      <!-- 로딩 / 비어있음 -->
      <div v-if="loading" class="placeholder-box bodyLight12px">
        불러오는 중…
      </div>
      <div
        v-else-if="!criteriaItems.length"
        class="placeholder-box bodyLight12px"
      >
        공개된 선정 기준이 없어요. (다음으로 진행 가능)
      </div>

      <!-- 체크리스트 (라벨=왼쪽 텍스트, 아이콘=오른쪽) -->
      <ul v-else class="checklist">
        <li v-for="(item, i) in criteriaItems" :key="i" class="row">
          <label class="check">
            <input
              type="checkbox"
              class="native"
              :value="item"
              v-model="selected"
            />
            <!-- 미체크는 회색, 체크되면 진한 검정 -->
            <span class="label bodyMedium16px">{{ item }}</span>
            <!-- 벡터 아이콘 (오른쪽) -->
            <span class="icon" aria-hidden="true"></span>
          </label>
        </li>
      </ul>
    </main>

    <div class="cta-wrap px">
      <BottomCTA :label="'다음'" :reserveBottom="8" @click="goNext">
        <template #below><div class="cta-spacer" /></template>
      </BottomCTA>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import TopMessage from '@/pages/financial/components/TopMessage.vue';
import BottomCTA from '@/pages/financial/components/BottomCTA.vue';
import { useFinancialStore } from '@/stores/financial';
import * as grants from '@/api/grants';

const store = useFinancialStore();
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const service = ref(null);
const criteriaItems = ref([]);
const selected = ref([]);

function parseLines(txt = '') {
  return String(txt)
    .split(/\r?\n|\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function resolveServiceId() {
  let id = Number(route.query.id || 0);
  if (id) return id;
  const kw = sessionStorage.getItem('financial-keyword') || '';
  if (!kw) return 0;
  const arr = (await grants.searchGrants(kw)) || [];
  const hit = arr.find((x) => x.serviceName?.includes(kw)) || arr[0];
  return hit?.serviceId || 0;
}

onMounted(async () => {
  loading.value = true;
  try {
    const id = await resolveServiceId();
    if (!id) throw new Error('no serviceId');

    const chk = await grants.getGrantChecklist(id);
    criteriaItems.value = parseLines(chk.selectionCriteria || '');

    service.value = await grants.getGrantDetail(id);

    selected.value = store.support?.criteria?.selected || [];
  } catch (e) {
    console.error('서비스 로드 실패:', e);
    service.value = null;
    criteriaItems.value = [];
  } finally {
    loading.value = false;
  }
});

function toggle(item) {
  const i = selected.value.indexOf(item);
  if (i >= 0) selected.value.splice(i, 1);
  else selected.value.push(item);
}

function goNext() {
  store.$patch({
    support: {
      ...(store.support || {}),
      criteria: { selected: [...selected.value] },
    },
  });
  router.push({
    path: '/financial/support-docs',
    query: { id: service.value?.serviceId },
  });
}
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.service-title {
  color: var(--color-darkgray);
}

/* 로딩/빈 상태 박스 */
.placeholder-box {
  padding: 0.75rem 1rem;
  border: 1px dashed var(--color-lightgray);
  border-radius: 12px;
  color: var(--color-darkgray);
}

/* 체크리스트 */
.checklist {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}

.row {
  display: flex;
  align-items: center;
}

.check {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  padding: 0.25rem 0;
}

/* 커스텀 체크박스 */
.native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid var(--color-lightgray);
  display: inline-block;
  position: relative;
  transition: 0.15s ease;
}
.native:focus-visible + .box {
  outline: 2px solid var(--color-primary-10);
  outline-offset: 2px;
}
.native:checked + .box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.native:checked + .box::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 0px;
  width: 8px;
  height: 14px;
  border: 2px solid #fff;
  border-top: 0;
  border-left: 0;
  transform: rotate(45deg);
}

/* 라벨 색: 기본 회색, 체크 시 검정 */
.label {
  color: #8e8e95;
  transition: color 0.15s ease;
}
.native:checked ~ .label {
  color: var(--color-black);
}

/* 오른쪽 아이콘: SVG 벡터 (data URI) */
.icon {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  /* 미체크: 회색 원형 */
  background-image: url("data:image/svg+xml;utf8,\<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239EA2A8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/></svg>");
}

/* 체크됨: 파랑 원형 + 체크 */
.native:checked ~ .icon {
  background-image: url("data:image/svg+xml;utf8,\<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%230E0B80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/><path d='M8 12l3 3 5-5'/></svg>");
}

/* 포커스 링 (키보드 접근성) */
.native:focus-visible ~ .icon {
  outline: 2px solid var(--color-primary-10);
  outline-offset: 2px;
}

/* CTA 붙이기 */
.cta-wrap {
  margin-top: auto;
}
.cta-spacer {
  height: 1.185rem;
}
</style>
