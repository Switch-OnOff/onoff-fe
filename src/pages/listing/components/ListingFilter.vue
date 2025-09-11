<!-- src/pages/listing/components/ListingFilters.vue -->
<template>
  <div class="filters-wrap">
    <div class="filters-bar">
      <div class="category-row">
        <div class="search">
          <input
            class="search-input bodyMedium14px"
            v-model.trim="searchText"
            type="search"
            placeholder="지역 검색"
            aria-label="지역 검색"
            @keydown.enter="onSearch"
          />
          <img :src="iconSearch" alt="" class="search-ico" aria-hidden="true" />
        </div>

        <select
          class="select bodyMedium14px"
          v-model="draft.major"
          @change="onMajorChange"
          aria-label="업종 대분류"
        >
          <option value="">{{ majorPlaceholder }}</option>
          <option v-for="c in MAJORS" :key="c" :value="c">{{ c }}</option>
        </select>

        <select
          class="select bodyMedium14px"
          v-model="draft.minor"
          :disabled="!draft.major"
          aria-label="업종 중분류"
        >
          <option value="">{{ minorPlaceholder }}</option>
          <option v-for="c in minorsOfMajor" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="deal-row">
        <div class="deal-segment" role="tablist" aria-label="거래 유형">
          <div class="segment-track" :data-active="draft.dealType">
            <button
              type="button"
              class="seg-btn bodyMedium14px"
              :class="{ on: draft.dealType==='ALL' }"
              @click="draft.dealType='ALL'"
              role="tab"
              :aria-selected="draft.dealType==='ALL'"
            >전체</button>
            <button
              type="button"
              class="seg-btn bodyMedium14px"
              :class="{ on: draft.dealType==='SALE' }"
              @click="draft.dealType='SALE'"
              role="tab"
              :aria-selected="draft.dealType==='SALE'"
            >매매</button>
            <button
              type="button"
              class="seg-btn bodyMedium14px"
              :class="{ on: draft.dealType==='MONTHLY' }"
              @click="draft.dealType='MONTHLY'"
              role="tab"
              :aria-selected="draft.dealType==='MONTHLY'"
            >월세</button>
            <i class="seg-thumb" aria-hidden="true"></i>
          </div>
        </div>

        <div class="actions">
          <button class="btn-detail bodyMedium14px" type="button" @click="openSheet = true">상세필터</button>
          <button class="btn-reset bodyMedium14px" type="button" @click="resetAll">초기화</button>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div class="sheet-backdrop" v-if="openSheet" @click.self="closeSheet"></div>

      <div
        class="sheet"
        v-if="openSheet"
        role="dialog"
        aria-modal="true"
        aria-label="상세 필터"
        @keydown.esc="closeSheet"
      >
        <header class="sheet-head">
          <span class="sheet-handle" aria-hidden="true"></span>
          <h4 class="titleExtra20px">상세 필터</h4>
          <button class="x" type="button" aria-label="닫기" @click="closeSheet">×</button>
        </header>

        <div class="sheet-body">
          <RangeField
            label="권리금" :unit="'원'"
            v-model:from="draft.premium.min" v-model:to="draft.premium.max"
            :min="PREMIUM.min" :max="PREMIUM.max" :step="PREMIUM.step"
          />
          <RangeField
            label="매매가" :unit="'원'"
            v-model:from="draft.salePrice.min" v-model:to="draft.salePrice.max"
            :min="SALE.min" :max="SALE.max" :step="SALE.step"
          />
          <RangeField
            label="보증금" :unit="'원'"
            v-model:from="draft.deposit.min" v-model:to="draft.deposit.max"
            :min="DEPOSIT.min" :max="DEPOSIT.max" :step="DEPOSIT.step"
          />
          <RangeField
            label="월세" :unit="'원'"
            v-model:from="draft.rent.min" v-model:to="draft.rent.max"
            :min="RENT.min" :max="RENT.max" :step="RENT.step"
          />
          <RangeField
            label="면적(평)" :unit="'평'"
            v-model:from="draft.areaPyeong.min" v-model:to="draft.areaPyeong.max"
            :min="AREA.min" :max="AREA.max" :step="AREA.step"
          />
        </div>

        <footer class="sheet-foot">
          <button class="btn-reset bodyMedium14px" type="button" @click="resetSliders">초기화</button>
          <button class="btn-apply bodyMedium14px" type="button" @click="applyAndClose">적용</button>
        </footer>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { reactive, computed, watch, ref, defineComponent } from 'vue'
import iconSearch from '@/assets/icons/search.png'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      major: '',
      minor: '',
      dealType: 'ALL',
      premium:    { min: 0, max: 200_000_000 },
      salePrice:  { min: 0, max: 2_000_000_000 },
      deposit:    { min: 0, max: 300_000_000 },
      rent:       { min: 0, max: 10_000_000 },
      areaPyeong: { min: 0, max: 200 },
    })
  }
})
const emit = defineEmits(['update:modelValue', 'apply', 'reset', 'change', 'search-location'])

const majorPlaceholder = '대분류'
const minorPlaceholder = '중분류'

const PREMIUM = { min: 0, max: 200_000_000,  step: 1_000_000 }
const SALE    = { min: 0, max: 2_000_000_000,step: 10_000_000 }
const DEPOSIT = { min: 0, max: 300_000_000,  step: 1_000_000 }
const RENT    = { min: 0, max: 10_000_000,   step: 50_000 }
const AREA    = { min: 0, max: 200,          step: 1 }

const DEFAULTS = {
  major: '',
  minor: '',
  dealType: 'ALL',
  premium:    { min: PREMIUM.min, max: PREMIUM.max },
  salePrice:  { min: SALE.min,    max: SALE.max    },
  deposit:    { min: DEPOSIT.min, max: DEPOSIT.max },
  rent:       { min: RENT.min,    max: RENT.max    },
  areaPyeong: { min: AREA.min,    max: AREA.max    },
}

const MAJORS = ['카페/디저트', '음식점', '주점', '미용/뷰티', '서비스', '소매/유통', '기타']
const MINORS_MAP = {
  '카페/디저트': ['카페', '디저트', '베이커리', '커피전문점'],
  '음식점': ['한식', '중식', '일식', '양식', '분식', '패스트푸드'],
  '주점': ['호프', '와인바', '칵테일', '이자카야'],
  '미용/뷰티': ['헤어', '네일', '피부관리', '왁싱'],
  '서비스': ['세탁', '스터디카페', 'PC방', '키즈카페'],
  '소매/유통': ['편의점', '디스카운트', '의류', '잡화'],
  '기타': ['기타'],
}

const openSheet = ref(false)
const searchText = ref('')
const draft = reactive(cloneDeep(props.modelValue))

watch(() => props.modelValue, (nv) => {
  Object.assign(draft, cloneDeep(nv))
}, { deep: true })

const minorsOfMajor = computed(() => (draft.major ? (MINORS_MAP[draft.major] || []) : []))
function onMajorChange() {
  if (!minorsOfMajor.value.includes(draft.minor)) draft.minor = ''
}

function onSearch() {
  const q = (searchText.value || '').trim()
  if (!q) return
  emit('search-location', q)
}

/* 자동 적용(디바운스) */
let autoTimer = null
let lastSig = ''
const sig = () => JSON.stringify(draft)

function emitBase() {
  const s = sig()
  if (s === lastSig) return null
  lastSig = s
  const copy = JSON.parse(s)
  emit('update:modelValue', copy)
  return copy
}
function emitChange() {
  const copy = emitBase()
  if (copy) emit('change', copy)
}
function emitApply() {
  const copy = emitBase()
  if (copy) {
    emit('change', copy)
    emit('apply', copy)
  } else {
    emit('apply', JSON.parse(lastSig || sig()))
  }
}
function scheduleAutoApply(){ clearTimeout(autoTimer); autoTimer = setTimeout(emitChange, 80) }

watch(() => draft.major, scheduleAutoApply)
watch(() => draft.minor, scheduleAutoApply)
watch(() => draft.dealType, scheduleAutoApply)
watch(() => [
  draft.premium.min, draft.premium.max,
  draft.salePrice.min, draft.salePrice.max,
  draft.deposit.min, draft.deposit.max,
  draft.rent.min, draft.rent.max,
  draft.areaPyeong.min, draft.areaPyeong.max
], scheduleAutoApply)

function resetAll() {
  Object.assign(draft, cloneDeep(DEFAULTS))
  emit('reset')
  emitChange()
}
function resetSliders() {
  draft.premium    = cloneDeep(DEFAULTS.premium)
  draft.salePrice  = cloneDeep(DEFAULTS.salePrice)
  draft.deposit    = cloneDeep(DEFAULTS.deposit)
  draft.rent       = cloneDeep(DEFAULTS.rent)
  draft.areaPyeong = cloneDeep(DEFAULTS.areaPyeong)
}
function applyAndClose() { emitApply(); closeSheet() }

watch(openSheet, (v) => {
  const el = document.documentElement
  el.style.overflow = v ? 'hidden' : ''
})
function closeSheet() { openSheet.value = false }

function cloneDeep(o){ return JSON.parse(JSON.stringify(o)) }

const RangeField = defineComponent({
  name: 'RangeField',
  props: { label:String, unit:{type:String,default:''}, min:Number, max:Number, step:{type:Number,default:1}, from:Number, to:Number },
  emits: ['update:from', 'update:to'],
  data(){ return { localFrom: this.from ?? this.min, localTo: this.to ?? this.max } },
  watch: {
    min(v){ if (this.localFrom < v) this.localFrom = v },
    max(v){ if (this.localTo > v) this.localTo = v },
    from(v){ if (typeof v==='number') this.localFrom = v },
    to(v){ if (typeof v==='number') this.localTo = v },
  },
  methods:{
    nf(n){ try { return Number(n).toLocaleString('ko-KR') } catch { return n } },
    clamp(){
      if (this.localFrom > this.localTo) { const t=this.localFrom; this.localFrom=this.localTo; this.localTo=t }
      if (this.localFrom < this.min) this.localFrom = this.min
      if (this.localTo > this.max) this.localTo = this.max
      this.$emit('update:from', Number(this.localFrom))
      this.$emit('update:to',   Number(this.localTo))
    },
    pct(v){ return ((v - this.min) / (this.max - this.min)) * 100 }
  },
  template: `
  <div class="range-field">
    <div class="field-head">
      <span class="field-label bodyMedium14px">{{ label }}</span>
      <span class="field-val bodyMedium14px">{{ nf(localFrom) }}{{ unit }} ~ {{ nf(localTo) }}{{ unit }}</span>
    </div>
    <div class="dual-range" :style="{ '--from': pct(localFrom) + '%', '--to': pct(localTo) + '%' }">
      <input type="range" :min="min" :max="max" :step="step" v-model.number="localFrom" @input="clamp" aria-label="최소값" />
      <input type="range" :min="min" :max="max" :step="step" v-model.number="localTo" @input="clamp" aria-label="최대값" />
    </div>
    <div class="ticks">
      <span class="tick bodyMedium12px">{{ nf(min) }}</span>
      <span class="tick bodyMedium12px">{{ nf(max) }}</span>
    </div>
  </div>
  `
})
</script>

<style scoped>
.filters-wrap { width: 100%; }

.filters-bar {
  display: grid;
  grid-template-rows: auto auto;
  gap: 10px;
  padding-top: 8px;
}

.select {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--color-lightgray);
  background: var(--color-white);
  border-radius: 10px;
  color: var(--color-lightblack);
  -webkit-tap-highlight-color: transparent;
}

/* 1) 지역 검색 + 대/중분류 */
.category-row{
  display: grid;
  grid-template-columns: 1.2fr .9fr .9fr;
  gap: 8px;
  align-items: center;
}
.search{
  position: relative;
}
.search-input{
  width: 100%;
  height: 36px;
  padding: 0 36px 0 12px;
  border: 1px solid var(--color-lightgray);
  background: var(--color-white);
  border-radius: 10px;
  color: var(--color-lightblack);
}
.search-ico{
  position: absolute;
  right: 10px; top: 50%;
  transform: translateY(-50%);
  width: 18px; height: 18px;
  object-fit: contain;
  pointer-events: none;
}

/* 2) 거래유형 + 액션 */
.deal-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}
.deal-segment { min-width: 0; }
.deal-segment .segment-track { width: 100%; }

.segment-track{
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 36px;
  background: var(--color-white);
  border: 1px solid var(--color-lightgray);
  border-radius: 9999px;
  box-sizing: border-box;
  overflow: hidden;
}
.seg-btn{
  height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 0 12px; margin: 0; line-height: 1;
  background: transparent; border: none; color: var(--color-lightblack);
  z-index: 1; white-space: nowrap;
}
.seg-btn.on{ color: var(--color-primary); }
.seg-thumb{
  position: absolute; top: 3px; bottom: 3px; left: 1.5px;
  width: calc(33.333% - 1px);
  border-radius: 9999px;
  background: var(--color-primary-10);
  transition: transform .24s ease;
}
.segment-track[data-active="SALE"]    .seg-thumb{ transform: translateX(100%); }
.segment-track[data-active="MONTHLY"] .seg-thumb{ transform: translateX(200%); }

.actions{
  display: flex; gap: 8px;
  width: clamp(180px, 28vw, 260px);
}
.btn-detail,.btn-reset{
  flex: 1 1 0;
  height: 36px; padding: 0 12px;
  border-radius: 10px; border: 1px solid var(--color-lightgray);
  background: var(--color-white); color: var(--color-lightblack);
  text-align: center; white-space: nowrap;
}

/* 바텀시트/슬라이더 */
.sheet-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 9999; }
.sheet {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 10000;
  background: var(--color-white);
  border-top-left-radius: 16px; border-top-right-radius: 16px;
  box-shadow: 0 -4px 24px rgba(0,0,0,.14);
  padding: 8px 12px 10px;
  max-height: 80vh;
  display: grid; grid-template-rows: auto 1fr auto; gap: 10px;
}
.sheet-head { position: relative; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
.sheet-handle { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 40px; height: 4px; border-radius: 9999px; background: var(--color-lightgray); }
.sheet-head h4 { grid-column: 1 / -1; text-align: center; color: var(--color-black); padding-top: 8px; }
.x { position: absolute; right: 0; top: 4px; width: 36px; height: 36px; border: 1px solid var(--color-lightgray); background: var(--color-white); border-radius: 10px; cursor: pointer; }
.sheet-body { overflow: auto; display: grid; gap: 12px; padding-right: 2px; }
.sheet-foot { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-bottom: env(safe-area-inset-bottom); }
.btn-apply { height: 36px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--color-primary); background: var(--color-primary); color: var(--color-white); }

.range-field { border: 1px solid var(--color-lightgray); border-radius: 12px; padding: 10px; background: var(--color-white); }
.field-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.field-label { color: var(--color-lightblack); }
.field-val { color: var(--color-lightblack); }
.dual-range { position: relative; height: 32px; }
.dual-range::before { content: ""; position: absolute; left: 0; right: 0; top: 15px; height: 4px; border-radius: 999px; background: var(--color-lightgray); }
.dual-range::after { content: ""; position: absolute; left: var(--from); right: calc(100% - var(--to)); top: 15px; height: 4px; border-radius: 999px; background: var(--color-primary); }
.dual-range input[type="range"]{ position: absolute; left: 0; right: 0; width: 100%; appearance: none; background: transparent; pointer-events: none; height: 32px; margin: 0; }
.dual-range input[type="range"]::-webkit-slider-thumb,
.dual-range input[type="range"]::-moz-range-thumb{
  appearance: none; pointer-events: auto; width: 22px; height: 22px; border-radius: 50%;
  background: #fff; border: 1px solid var(--color-lightgray); box-shadow: 0 1px 2px rgba(0,0,0,.08);
}

@media (max-width: 360px) {
  .category-row{ grid-template-columns: 1fr; }
}
</style>
