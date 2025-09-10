<template>
  <div class="wizard-page">
    <SimpleHeader title="양도 매물 등록">
      <!-- 헤더 우측: 테스트용 스킵 버튼 (스텝 1~3에서 표시) -->
      <template #action>
        <button
          v-if="step < 4"
          type="button"
          class="header-skip bodyMedium14px"
          @click="skipToNext"
        >
          다음(건너뛰기)
        </button>
      </template>
    </SimpleHeader>

    <!-- STEP 1: 진위확인 -->
    <section class="step" v-if="step === 1">
      <h2 class="titleExtra28px">사업자 진위확인</h2>

      <form class="form" @submit.prevent="onVerify">
        <!-- 사업자등록번호 (숫자만, 10자리 제한) -->
        <InputField label="사업자등록번호" placeholder="숫자 10자리">
          <input
            class="input-box bodyMedium16px"
            type="tel"
            inputmode="numeric"
            pattern="\\d*"
            :value="formStep1.bNo"
            maxlength="10"
            placeholder="숫자 10자리"
            @input="onBNoInput"
            autocomplete="off"
          />
        </InputField>

        <!-- 대표자명 -->
        <InputField
          label="대표자명"
          placeholder="대표자명을 입력하세요"
          v-model="formStep1.ownerName"
        />

        <!-- 개업일자 (숫자만, 8자리 제한) -->
        <InputField label="개업일자" placeholder="예) 20230101">
          <input
            class="input-box bodyMedium16px"
            type="tel"
            inputmode="numeric"
            pattern="\\d*"
            :value="formStep1.openDt"
            maxlength="8"
            placeholder="예) 20230101"
            @input="onOpenDtInput"
            autocomplete="off"
          />
        </InputField>

        <div class="row">
          <MedSubmitBtn
            :text="verifying ? '확인 중' : '진위확인'"
            :disabled="verifying"
            @click="onVerify"
          />
        </div>

        <p v-if="errorMsg" class="error bodyMedium14px">{{ errorMsg }}</p>
      </form>
    </section>

    <!-- STEP 2: 기본 정보 -->
    <section class="step" v-else-if="step === 2">
      <h2 class="titleExtra28px">기본 정보</h2>

      <!-- 1단계 정보 요약 -->
      <dl class="biz-kv">
        <div class="kv">
          <dt class="kv-key bodyMedium14px">사업자등록번호</dt>
          <dd class="kv-val bodyMedium14px">{{ verified.bNo || '-' }}</dd>
        </div>
        <div class="kv">
          <dt class="kv-key bodyMedium14px">대표자명</dt>
          <dd class="kv-val bodyMedium14px">{{ verified.ownerName || '-' }}</dd>
        </div>
        <div class="kv">
          <dt class="kv-key bodyMedium14px">개업일자</dt>
          <dd class="kv-val bodyMedium14px">{{ verified.openDt || '-' }}</dd>
        </div>
      </dl>

      <form class="form" @submit.prevent="goStep(3)">
        <!-- 업종 -->
        <label class="bodyMedium16px">업종</label>
        <IndustryPicker
          v-model:major="formStep2.industryMajor"
          v-model:minor="formStep2.industryMinor"
          :categories="INDUSTRY_CATEGORIES"
        />

        <!-- 거래유형 + 금액 입력 묶음 -->
        <label class="bodyMedium16px">거래유형</label>
        <div class="deal-card">
          <!-- 상단 탭 세그먼트(카드 상단에 붙음) -->
          <div class="deal-seg" role="tablist" aria-label="거래 유형">
            <button
              type="button"
              class="seg-btn bodyMedium14px"
              :class="{ active: formStep2.dealType === '월세' }"
              :aria-pressed="formStep2.dealType === '월세'"
              @click="formStep2.dealType = '월세'"
            >
              월세
            </button>
            <button
              type="button"
              class="seg-btn bodyMedium14px"
              :class="{ active: formStep2.dealType === '매매' }"
              :aria-pressed="formStep2.dealType === '매매'"
              @click="formStep2.dealType = '매매'"
            >
              매매
            </button>
          </div>

          <!-- 카드 본문 -->
          <div class="deal-body">
            <!-- 월세 -->
            <template v-if="formStep2.dealType === '월세'">
              <label class="bodyMedium14px label-inline">
                보증금(만원)
                <span v-if="depositWon" class="label-right bodyRegular12px">{{ depositWon }}</span>
              </label>
              <MoneyInput v-model.number="formStep2.deposit" />
              <NumberButtonGroup
                :labels="['10만원', '100만원', '1천만원', '1억']"
                :amounts="[10, 100, 1000, 10000]"
                @add="v => addAmount('deposit', v)"
              />

              <label class="bodyMedium14px label-inline">
                월세(만원)
                <span v-if="rentWon" class="label-right bodyRegular12px">{{ rentWon }}</span>
              </label>
              <MoneyInput v-model.number="formStep2.rent" />
              <NumberButtonGroup
                :labels="['10만원', '100만원', '1천만원', '1억']"
                :amounts="[10, 100, 1000, 10000]"
                @add="v => addAmount('rent', v)"
              />
            </template>

            <!-- 매매 -->
            <template v-else>
              <label class="bodyMedium14px label-inline">
                매매가(만원)
                <span v-if="saleWon" class="label-right bodyRegular12px">{{ saleWon }}</span>
              </label>
              <MoneyInput v-model.number="formStep2.salePrice" />
              <NumberButtonGroup
                :labels="['10만원', '100만원', '1천만원', '1억']"
                :amounts="[10, 100, 1000, 10000]"
                @add="v => addAmount('salePrice', v)"
              />
            </template>
          </div>
        </div>

        <!-- 권리금/관리비 -->
        <label class="bodyMedium16px label-inline">
          권리금(만원)
          <span v-if="premiumWon" class="label-right bodyLight12px">{{ premiumWon }}</span>
        </label>
        <div class="gap-tight">
          <MoneyInput v-model.number="formStep2.premium" />
        </div>

        <!-- 권리금 버튼 그룹(프리셋) -->
        <NumberButtonGroup
          class="nbg-premium"
          :labels="['10만원', '100만원', '1천만원', '1억']"
          :amounts="[10, 100, 1000, 10000]"
          @add="v => addAmount('premium', v)"
        />

        <label class="bodyMedium16px label-inline">
          관리비(만원)
          <span v-if="mgmtFeeWon" class="label-right bodyLight12px">{{ mgmtFeeWon }}</span>
        </label>
        <MoneyInput v-model.number="formStep2.mgmtFee" />

        <!-- 양도가능일 -->
        <label class="bodyMedium16px">양도가능일</label>
        <TransferDateField
          v-model:type="formStep2.transfer.type"
          v-model:date="formStep2.transfer.date"
        />

        <!-- 상가형태 -->
        <label class="bodyMedium16px">상가형태</label>
        <select class="input" v-model="formStep2.shopType">
          <option value="">선택</option>
          <option>근린상가</option>
          <option>로데오/먹자골목</option>
          <option>오피스상권</option>
          <option>주상복합</option>
          <option>몰/쇼핑센터</option>
          <option>기타/확인필요</option>
        </select>

        <!-- 면적 -->
        <label class="bodyMedium16px">면적</label>
        <AreaInput
          v-model:m2Supply="formStep2.area.supply"
          v-model:m2Exclusive="formStep2.area.exclusive"
        />

        <!-- 층 정보 -->
        <label class="bodyMedium16px">층 정보</label>
        <FloorInput
        v-model:isBasement="formStep2.floor.isBasement"
        v-model:current="formStep2.floor.current"
        v-model:total="formStep2.floor.total"
        />

        <!-- 주차 -->
        <label class="bodyMedium16px">주차</label>
        <ParkingCard
        v-model:type="formStep2.parking.type"
        v-model:count="formStep2.parking.count"
        v-model:paid="formStep2.parking.paid"
        />

        <!-- 화장실 -->
        <label class="bodyMedium16px">화장실</label>
        <select class="input" v-model="formStep2.restroom">
          <option value="">선택</option>
          <option>내부</option>
          <option>외부(개인)</option>
          <option>외부(공용)</option>
        </select>

        <!-- 주소 -->
        <label class="bodyMedium16px">위치(주소)</label>
        <AddressSearch
        v-model:baseAddress="formStep2.address.base"
        v-model:detailAddress="formStep2.address.detail"
        v-model:zonecode="formStep2.address.zip"
        />

        <div class="row gap">
          <MedSubmitBtn text="다음" @click="goStep(3)" />
        </div>
      </form>
    </section>

    <!-- STEP 3 상세 설명 -->
    <section class="step" v-else-if="step === 3">
      <h2 class="titleExtra28px">상세 설명</h2>

      <textarea
        class="textarea"
        rows="8"
        v-model="formStep3.description"
        placeholder="상세 설명을 작성하세요."
      ></textarea>

      <div class="row gap">
        <button class="btn-secondary bodyMedium16px" @click="goStep(2)">
          이전
        </button>
        <MedSubmitBtn text="다음" @click="goStep(4)" />
      </div>
    </section>

    <!-- STEP 4: 사진 등록 -->
    <section class="step" v-else-if="step === 4">
      <h2 class="titleExtra28px">사진 등록 (3~10장)</h2>

      <input type="file" multiple accept="image/*" @change="onFiles" />
      <div class="thumbs">
        <img v-for="(p, i) in photosPreview" :key="i" :src="p" alt="" />
      </div>
      <p class="hint bodyRegular12px">최소 3장, 최대 10장 업로드</p>

      <div class="row gap">
        <button class="btn-secondary bodyMedium16px" @click="goStep(3)">
          이전
        </button>
        <MedSubmitBtn
          text="등록 완료"
          :disabled="photos.length < 3 || photos.length > 10"
          @click="submitAll"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'

import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import MedSubmitBtn from '@/components/button/MedSubmitBtn.vue'
import InputField from '@/components/input/InputField.vue'

import IndustryPicker from '@/pages/listing/components/IndustryPicker.vue'
import MoneyInput from '@/pages/listing/components/MoneyInput.vue'
import AreaInput from '@/pages/listing/components/AreaInput.vue'
import TransferDateField from '@/pages/listing/components/TransferDateField.vue'
import AddressSearch from '@/pages/listing/components/AddressSearch.vue'
import KakaoMapAddress from '@/components/map/KakaoMapAddress.vue'
import NumberButtonGroup from '@/components/input/NumberButtonGroup.vue'
import FloorInput from '@/pages/listing/components/FloorInput.vue'
import ParkingCard from '@/pages/listing/components/ParkingCard.vue'

const step = ref(1)
const verifying = ref(false)
const errorMsg = ref('')

const INDUSTRY_CATEGORIES = [
  { major: '일반음식점', minors: ['한식', '중식', '양식', '분식', '치킨', '카페/디저트'] },
  { major: '서비스업', minors: ['미용', '세탁', '교육', '기타'] },
  { major: '소매', minors: ['편의점', '잡화', '의류', '기타'] },
]

const formStep1 = reactive({
  bNo: '',
  ownerName: '',
  openDt: '', // YYYYMMDD
})

const verified = reactive({
  ok: false,
  bNo: '',
  ownerName: '',
  openDt: '',
})

const formStep2 = reactive({
  industryMajor: '',
  industryMinor: '',
  dealType: '월세',
  deposit: null,
  rent: null,
  salePrice: null,
  premium: null,
  mgmtFee: null,
  transfer: { type: '협의', date: '' }, // '날짜' | '협의' | '즉시'
  shopType: '',
  area: { supply: null, exclusive: null }, // m2
  floor: { isBasement: false, current: null, total: null },
  parking: { type: '', count: null, paid: false },
  restroom: '',
  address: { base: '', detail: '' },
})

const mgmtFeeWon = computed(() => manToKoreanWon(formStep2.mgmtFee))

const formStep3 = reactive({
  description: '',
})

const photos = ref([])
const photosPreview = ref([])

function goStep(n) { step.value = n }

function skipToNext() {
  if (step.value === 1) {
    verified.bNo = formStep1.bNo
    verified.ownerName = formStep1.ownerName
    verified.openDt = formStep1.openDt
    verified.ok = false
  }
  if (step.value < 4) step.value += 1
}

function onlyDigitsLen(val, max) {
  return String(val || '').replace(/\D/g, '').slice(0, max)
}
function onBNoInput(e) { formStep1.bNo = onlyDigitsLen(e.target.value, 10) }
function onOpenDtInput(e) { formStep1.openDt = onlyDigitsLen(e.target.value, 8) }

async function onVerify() {
  errorMsg.value = ''
  verifying.value = true
  try {
    const { data } = await axios.post('/api/nts/validate', {
      b_no: formStep1.bNo.replace(/\D/g, ''),
      p_nm: formStep1.ownerName.trim(),
      start_dt: formStep1.openDt.replace(/\D/g, ''),
    })
    if (data?.ok && data?.valid) {
      verified.ok = true
      verified.bNo = formStep1.bNo
      verified.ownerName = formStep1.ownerName
      verified.openDt = formStep1.openDt
      goStep(2)
    } else {
      errorMsg.value = data?.message || '진위확인 실패'
    }
  } catch (e) {
    errorMsg.value = '서버 오류로 확인에 실패했습니다.'
  } finally {
    verifying.value = false
  }
}

function onFiles(e) {
  const files = Array.from(e.target.files || [])
  photos.value = files.slice(0, 10)
  photosPreview.value = photos.value.map((f) => URL.createObjectURL(f))
}

function addAmount(field, delta) {
  const current = Number(formStep2[field] ?? 0) || 0
  const next = current + Number(delta || 0)
  formStep2[field] = Math.max(0, next)
}

/** 금액(만원) → 한글 원 표기 */
function manToKoreanWon(num) {
  const n = Number(num)
  if (!n) return ''
  let rest = Math.floor(n * 10000) // 원
  const eok = Math.floor(rest / 100000000)
  rest = rest % 100000000
  const man = Math.floor(rest / 10000)
  const won = rest % 10000

  const parts = []
  if (eok) parts.push(`${eok}억`)
  if (man) parts.push(`${man}만`)
  if (won) parts.push(`${won.toLocaleString()}원`)
  if (!won) parts.push('원')
  return parts.join(' ').trim()
}

const depositWon = computed(() => manToKoreanWon(formStep2.deposit))
const rentWon    = computed(() => manToKoreanWon(formStep2.rent))
const saleWon    = computed(() => manToKoreanWon(formStep2.salePrice))
const premiumWon = computed(() => manToKoreanWon(formStep2.premium))

const payload = computed(() => {
  const restroomForDb = (() => {
    if (formStep2.restroom === '외부(공용)') return '공용'
    if (formStep2.restroom === '외부(개인)') return '개인'
    return formStep2.restroom
  })()
  const currentFloorNumber = formStep2.floor.isBasement
    ? -Math.abs(Number(formStep2.floor.current || 1))
    : Number(formStep2.floor.current || 0)

  return {
    biz: { bNo: verified.bNo, ownerName: verified.ownerName, openDt: verified.openDt },
    listing: {
      industry: `${formStep2.industryMajor}/${formStep2.industryMinor}`.replace(/\/$/, ''),
      dealType: formStep2.dealType,
      deposit: formStep2.dealType === '월세' ? formStep2.deposit : undefined,
      rent: formStep2.dealType === '월세' ? formStep2.rent : undefined,
      salePrice: formStep2.dealType === '매매' ? formStep2.salePrice : undefined,
      premium: formStep2.premium,
      mgmtFee: formStep2.mgmtFee,
      transfer: formStep2.transfer,
      shopType: formStep2.shopType,
      area: { supply: formStep2.area.supply, exclusive: formStep2.area.exclusive },
      floor: { current: currentFloorNumber, total: Number(formStep2.floor.total || 0) },
      parking: formStep2.parking,
      restroom: restroomForDb,
      address: `${formStep2.address.base} ${formStep2.address.detail}`.trim(),
    },
    description: formStep3.description,
  }
})

async function submitAll() {
  try {
    const fd = new FormData()
    fd.append('data', JSON.stringify(payload.value))
    photos.value.forEach((f, i) => fd.append('photos', f, f.name || `photo_${i}.jpg`))
    await axios.post('/api/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    alert('등록이 완료되었습니다.')
  } catch (e) {
    alert('등록 실패. 잠시 후 다시 시도해주세요.')
  }
}
</script>

<style scoped>
.wizard-page {
  max-width: 393px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  background: var(--color-white);
  box-sizing: border-box;
  overflow-x: hidden;
}

/* 단계 제목 */
.step > h2 {
  color: var(--color-primary);
  margin: 0 0 16px;
}

/* 헤더 우측 스킵 버튼 (임시) */
.header-skip {
  background: transparent;
  border: 1px solid var(--color-lightgray);
  border-radius: 8px;
  padding: 6px 10px;
  line-height: 1;
  cursor: pointer;
}

.step { display: block; }

/* === 폼 간격 커스터마이징 === */
.form { display: block; } /* gap 제거 */

.form > label {
  display: block;
  color: var(--color-primary);
  margin: 0;
}

.form > label + * {
  margin-top: 6px;
  margin-bottom: 18px;
}

/* 라벨 우측 금액(한글표기) 배치 */
.label-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.label-right {
  color: var(--color-darkgray);
  margin-left: 8px;
}

/* 입력 기본 */
.input,
.textarea,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 8px;
  font: inherit;
  background: #fff;
}
.textarea { resize: vertical; }

.row { display: flex; gap: 8px; }
.row.gap { justify-content: space-between; }

.btn-secondary {
  background: var(--color-white);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 10px;
  padding: 12px 16px;
  cursor: pointer;
}

.error { color: var(--color-error); }

/* ===== 거래유형 카드 ===== */
.deal-card {
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  overflow: hidden;     /* 탭과 카드가 한 몸처럼 */
  background: #fff;
  margin-bottom: 18px;
}

/* 상단 탭 세그먼트 */
.deal-seg {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-bottom: 1px solid var(--color-lightgray);
}
.deal-seg .seg-btn {
  padding: 10px 12px;
  background: #fff;
  border: 0;
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.deal-seg .seg-btn + .seg-btn { border-left: 1px solid var(--color-lightgray); }
.deal-seg .seg-btn:hover { background: var(--color-primary-10); }
.deal-seg .seg-btn.active {
  background: var(--color-primary-10);
  color: var(--color-primary);
  font-weight: 600;
}

/* 카드 본문 */
.deal-body { padding: 12px; }
.deal-body > label { margin-top: 2px; }
.deal-body > label + * { margin-top: 6px; }

/* 카드 내부 NumberButtonGroup 기본 간격 */
.deal-body :deep(.number-button-group) {
  margin-top: 8px;
  margin-bottom: 12px;
}

/* 공통 세그먼트(다른 곳에서 쓰일 수 있어 유지) */
.seg {
  display: inline-flex;
  border: 1px solid var(--color-lightgray);
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}
.seg-btn {
  flex: 1;
  padding: 8px 12px;
  background: var(--color-white);
  border: none;
  cursor: pointer;
}
.seg-btn.active { background: var(--color-primary-10); color: var(--color-primary); }

/* 2열 그리드 */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.mt8 { margin-top: 8px; }

/* 썸네일 */
.thumbs {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 8px; margin-top: 8px;
}
.thumbs img {
  width: 100%; height: 74px; object-fit: cover;
  border-radius: 8px; border: 1px solid var(--color-lightgray);
}

.hint { color: var(--color-darkgray); }

/* 요약표 */
.biz-kv {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin: 0 0 16px;
  padding: 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
}
.kv { display: grid; grid-template-columns: 110px 1fr; column-gap: 8px; align-items: center; }
.kv-key { color: var(--color-lightblack); }
.kv-val { color: var(--color-black); }

/* 페이지 내 슬롯 인풋 스타일 */
.input-box {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: 1px solid var(--color-lightgray);
  padding: 0 16px;
  margin-bottom: 18px;
  box-sizing: border-box;
  background: var(--color-white);
  transition: border 0.2s;
}
.input-box:focus { border-color: var(--color-primary); }
.input-box::placeholder { color: var(--color-mediumgray); }

/* 권리금: 라벨 - 인풋 간 6px, 인풋 - 버튼 간 6px */
.form > label + .gap-tight {
  margin-top: 6px;
  margin-bottom: 6px; 
}

/* 권리금 버튼 그룹: 위쪽 8px, 아래(다음 라벨) 24px */
:deep(.nbg-premium.number-button-group) {
  margin-top: 8px !important;
  margin-bottom: 24px !important;
}
</style>
