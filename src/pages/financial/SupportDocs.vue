<!-- src/pages/financial/SupportDocsPage.vue -->
<template>
  <div class="page">
    <SimpleHeader title="대출·지원금" />

    <TopMessage
      class="px"
      :prefix="'지원금 신청 시 필요한'"
      :highlight="'서류'"
      :suffix="' 준비 여부를 체크해주세요'"
    />

    <main class="content px">
      <div v-if="loading" class="placeholder-box bodyLight12px">
        불러오는 중…
      </div>

      <div v-else-if="!docItems.length" class="placeholder-box bodyLight12px">
        공개된 필요 서류가 없어요. (다음으로 진행 가능)
      </div>

      <!-- 동적 체크리스트 -->
      <ul v-else class="checklist">
        <li v-for="(item, i) in docItems" :key="i" class="row">
          <label class="check">
            <input
              class="native"
              type="checkbox"
              :value="item"
              v-model="selected"
            />
            <span class="label bodyMedium16px">{{ item }}</span>
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
const docItems = ref([]);
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
    docItems.value = parseLines(chk.requiredDocuments || '');
    service.value = await grants.getGrantDetail(id);

    selected.value = store.support?.docs?.selected || [];
  } catch (e) {
    console.error('서비스 로드 실패:', e);
    service.value = null;
    docItems.value = [];
  } finally {
    loading.value = false;
  }
});

function toggle(item) {
  const i = selected.value.indexOf(item);
  if (i >= 0) selected.value.splice(i, 1);
  else selected.value.push(item);
}

function finish() {
  store.$patch({
    support: {
      ...(store.support || {}),
      docs: { selected: [...selected.value] },
    },
  });
  router.push({
    path: '/financial/result',
    query: {
      id: service.value?.serviceId, // 혹시 결과에서 다시 API 쓰고 싶을 때
      product: service.value?.serviceName || '', // 지원금 이름 전달!
    },
  });
}

function goNext() {
  finish();
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

.native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* 라벨: 기본 회색, 체크되면 진한 검정 */
.label {
  color: #8e8e95;
  transition: color 0.15s ease;
}
.native:checked ~ .label {
  color: var(--color-black);
}

/* 오른쪽 벡터 아이콘 (미체크 / 체크) */
.icon {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  background-image: url("data:image/svg+xml;utf8,\<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239EA2A8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/></svg>");
}
.native:checked ~ .icon {
  background-image: url("data:image/svg+xml;utf8,\<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%230E0B80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/><path d='M8 12l3 3 5-5'/></svg>");
}
.native:focus-visible ~ .icon {
  outline: 2px solid var(--color-primary-10);
  outline-offset: 2px;
}

/* CTA */
.cta-wrap {
  margin-top: auto;
}
.cta-spacer {
  height: 1.185rem;
}
</style>
