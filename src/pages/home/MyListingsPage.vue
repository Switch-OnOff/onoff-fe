<template>
  <div class="my-listings-page">
    <SimpleHeader title="내 등록 매물" />

    <div class="page-body">
      <div class="seg">
        <button
          class="seg-btn bodyMedium14px"
          :class="{ on: statusFilter==='ALL' }"
          @click="statusFilter='ALL'"
        >전체</button>
        <button
          class="seg-btn bodyMedium14px"
          :class="{ on: statusFilter==='게시중' }"
          @click="statusFilter='게시중'"
        >게시중</button>
        <button
          class="seg-btn bodyMedium14px"
          :class="{ on: statusFilter==='검수중' }"
          @click="statusFilter='검수중'"
        >검수중</button>
        <button
          class="seg-btn bodyMedium14px"
          :class="{ on: statusFilter==='숨김' }"
          @click="statusFilter='숨김'"
        >숨김</button>
      </div>

      <div class="list">
        <ManageListingCard
          v-for="it in filtered"
          :key="it.id"
          v-bind="toCardProps(it)"
          @click="goDetail"
          @edit="editItem"
          @delete="confirmDelete"
        />
      </div>

      <div v-if="filtered.length===0" class="empty bodyRegular14px">
        등록된 매물이 없어요.
      </div>
    </div>

    <AlertModal
      :open="confirmOpen"
      title="삭제하시겠어요?"
      :message="confirmMessage"
      confirmText="삭제"
      cancelText="취소"
      @confirm="doDelete"
      @close="confirmOpen=false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import ManageListingCard from '@/pages/listing/components/ManageListingCard.vue'
import AlertModal from '@/components/modal/AlertModal.vue'

const router = useRouter()

// 목데이터 (ListingCard.vue 스키마에 맞춤)
const items = ref([
  {
    id: 101,
    img: '',
    industry: '일반음식점/양식',
    transactionType: '월세',
    deposit: 3000,      // 만원
    rent: 250,          // 만원
    salePrice: null,
    premium: 2000,      // 만원
    exclusiveArea: 22.4,// 평
    location: '서울 마포구 합정동',
    storeName: '수제버거 9번가', // 선택값(있으면 카드 타이틀에 사용)
    status: '게시중',
    updatedAt: '최근 수정 2025-09-10',
  },
  {
    id: 102,
    img: '',
    industry: '카페/디저트',
    transactionType: '매매',
    deposit: null,
    rent: null,
    salePrice: 68000,
    premium: 0,
    exclusiveArea: 18.0,
    location: '서울 강남구 역삼동',
    storeName: '상상 카페',
    status: '검수중',
    updatedAt: '최근 수정 2025-09-09',
  },
  {
    id: 103,
    img: '',
    industry: '주류/바',
    transactionType: '월세',
    deposit: 2000,
    rent: 180,
    salePrice: null,
    premium: 1500,
    exclusiveArea: 26.2,
    location: '서울 서초구 서초동',
    storeName: '와인 바로바',
    status: '숨김',
    updatedAt: '최근 수정 2025-09-03',
  },
])

const statusFilter = ref('ALL')

const filtered = computed(() => {
  if (statusFilter.value === 'ALL') return items.value
  return items.value.filter(it => it.status === statusFilter.value)
})

function toCardProps(it) {
  return {
    id: it.id,
    img: it.img,
    industry: it.industry,
    transactionType: it.transactionType,
    deposit: it.deposit,
    rent: it.rent,
    salePrice: it.salePrice,
    premium: it.premium,
    exclusiveArea: it.exclusiveArea,
    location: it.location,
    // 관리 페이지 전용(선택)
    storeName: it.storeName,
    status: it.status,
    updatedAt: it.updatedAt,
  }
}

function goDetail(id) {
  router.push({ name: 'listing-detail', params: { id } })
}
function editItem(id) {
  router.push({ name: 'listing-edit', params: { id } })
}

/* 삭제 확인 */
const confirmOpen = ref(false)
const confirmTarget = ref(null)
const confirmMessage = ref('')
function confirmDelete(id) {
  confirmTarget.value = id
  const target = items.value.find(i => i.id === id)
  confirmMessage.value = target
    ? `매물 “${target.storeName || target.industry || id}”를 삭제할까요?\n삭제 후 되돌릴 수 없어요.`
    : '이 매물을 삭제할까요?'
  confirmOpen.value = true
}
function doDelete() {
  if (confirmTarget.value == null) { confirmOpen.value = false; return }
  items.value = items.value.filter(i => i.id !== confirmTarget.value)
  confirmTarget.value = null
  confirmOpen.value = false
}
</script>

<style scoped>
.my-listings-page { background: var(--color-white); }

.page-body {
  padding: 12px 16px 20px;
  display: grid;
  gap: 12px;
}

/* 상태 세그먼트 - ① 4등분 동일 폭 */
.seg {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.seg-btn {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--color-lightgray);
  background: var(--color-white);
  color: var(--color-lightblack);
  cursor: pointer;
}
.seg-btn.on {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-10);
}

.list {
  display: grid;
  gap: 10px;
}

.empty {
  margin-top: 20px;
  text-align: center;
  color: var(--color-darkgray);
}
</style>