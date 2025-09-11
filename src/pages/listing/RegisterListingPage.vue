<template>
  <div class="wizard-page">
    <SimpleHeader title="양도 매물 등록">
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

    <!-- STEP 1 -->
    <section class="step" v-if="step === 1">
      <h2 class="titleExtra28px">사업자 진위확인</h2>
      <p class="desc bodyRegular12px">
        국세청 진위확인으로 사업자 정보를 확인합니다. 등록번호(10자리)·대표자명·개업일자를 입력하세요.
      </p>

      <form class="form" @submit.prevent="onVerify">
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

        <InputField
          label="대표자명"
          placeholder="대표자명을 입력하세요"
          v-model="formStep1.ownerName"
        />

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

    <!-- STEP 2 -->
    <section class="step" v-else-if="step === 2">
      <h2 class="titleExtra28px">기본 정보</h2>

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

      <form class="form" @submit.prevent="onNextStep2">
        <label class="bodyMedium16px">업종</label>
        <IndustryPicker
          v-model:major="formStep2.industryMajor"
          v-model:minor="formStep2.industryMinor"
          :categories="INDUSTRY_CATEGORIES"
        />

        <label class="bodyMedium16px">거래유형</label>
        <div class="deal-card">
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

          <div class="deal-body">
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

        <label class="bodyMedium16px label-inline">
          권리금(만원)
          <span v-if="premiumWon" class="label-right bodyRegular12px">{{ premiumWon }}</span>
        </label>
        <div class="gap-tight">
          <MoneyInput v-model.number="formStep2.premium" />
        </div>

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

        <label class="bodyMedium16px">양도가능일</label>
        <TransferDateField
          v-model:type="formStep2.transfer.type"
          v-model:date="formStep2.transfer.date"
        />

        <label class="bodyMedium16px">상호명</label>
        <InputSimple
          placeholder="상호명을 입력하세요"
          v-model="formStep2.storeName"
        />

        <label class="bodyMedium16px">상가형태</label>
        <SelectField
          v-model="formStep2.shopType"
          :items="SHOP_TYPES"
          placeholder="상가형태 선택"
        />

        <label class="bodyMedium16px">면적</label>
        <AreaInput
          v-model:m2Supply="formStep2.area.supply"
          v-model:m2Exclusive="formStep2.area.exclusive"
        />

        <label class="bodyMedium16px">층 정보</label>
        <FloorInput
          v-model:isBasement="formStep2.floor.isBasement"
          v-model:current="formStep2.floor.current"
          v-model:total="formStep2.floor.total"
        />

        <label class="bodyMedium16px">주차</label>
        <ParkingCard
          v-model:type="formStep2.parking.type"
          v-model:count="formStep2.parking.count"
          v-model:paid="formStep2.parking.paid"
        />

        <label class="bodyMedium16px">화장실</label>
        <SelectField
          v-model="formStep2.restroom"
          :items="RESTROOM_OPTIONS"
          placeholder="화장실 선택"
        />

        <!-- ✅ 배달 / 포장 추가 -->
        <label class="bodyMedium16px">배달</label>
        <SelectField
          v-model="formStep2.delivery"
          :items="DELIVERY_OPTIONS"
          placeholder="배달 선택"
        />

        <label class="bodyMedium16px">포장</label>
        <SelectField
          v-model="formStep2.takeout"
          :items="TAKEOUT_OPTIONS"
          placeholder="포장 선택"
        />

        <label class="bodyMedium16px">위치(주소)</label>
        <AddressSearch
          v-model:baseAddress="formStep2.address.base"
          v-model:detailAddress="formStep2.address.detail"
          v-model:zonecode="formStep2.address.zip"
        />

        <div class="row center submit-row">
          <MedSubmitBtn text="다음" @click="onNextStep2" />
        </div>
      </form>
    </section>

    <!-- STEP 3 -->
    <section class="step" v-else-if="step === 3">
      <h2 class="titleExtra28px">상세 설명</h2>
      <textarea
        class="textarea"
        rows="8"
        v-model="formStep3.description"
        placeholder="상세 설명을 작성하세요."
      ></textarea>
      <div class="row gap submit-row">
        <MedSubmitBtn text="다음" @click="goStep(4)" />
      </div>
    </section>

    <!-- STEP 4 -->
    <section class="step step-photos" v-else-if="step === 4">
      <h2 class="titleExtra28px">사진 등록 (1~5장)</h2>

      <PhotoUploader
        v-model="photos"
        :max="5"
        :min="1"
        :capture="true"
      />

      <p class="desc bodyRegular12px">
        사진은 최소 1장, 최대 5장까지 등록할 수 있어요.
      </p>

      <div class="row center submit-row">
        <MedSubmitBtn
          text="등록 완료"
          :disabled="!canSubmit"
          @click="submitAll"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import MedSubmitBtn from '@/components/button/MedSubmitBtn.vue'
import InputField from '@/components/input/InputField.vue'
import InputSimple from '@/components/input/InputSimple.vue'

import IndustryPicker from '@/pages/listing/components/IndustryPicker.vue'
import MoneyInput from '@/pages/listing/components/MoneyInput.vue'
import AreaInput from '@/pages/listing/components/AreaInput.vue'
import TransferDateField from '@/pages/listing/components/TransferDateField.vue'
import AddressSearch from '@/pages/listing/components/AddressSearch.vue'
import NumberButtonGroup from '@/components/input/NumberButtonGroup.vue'
import FloorInput from '@/pages/listing/components/FloorInput.vue'
import ParkingCard from '@/pages/listing/components/ParkingCard.vue'
import SelectField from '@/pages/listing/components/DropDown.vue'
import PhotoUploader from '@/pages/listing/components/PhotoUploader.vue'

const step = ref(1)
const verifying = ref(false)
const errorMsg = ref('')
const router = useRouter()

const INDUSTRY_CATEGORIES = [
  { major: '일반음식점', minors: ['한식', '중식', '양식', '분식', '치킨', '카페/디저트'] },
  { major: '서비스업', minors: ['미용', '세탁', '교육', '기타'] },
  { major: '소매', minors: ['편의점', '잡화', '의류', '기타'] },
]

const SHOP_TYPES = [
  { label: '근린상가', value: '근린상가' },
  { label: '로데오/먹자골목', value: '로데오/먹자골목' },
  { label: '오피스상권', value: '오피스상권' },
  { label: '주상복합', value: '주상복합' },
  { label: '몰/쇼핑센터', value: '몰/쇼핑센터' },
  { label: '기타/확인필요', value: '기타/확인필요' },
]

const RESTROOM_OPTIONS = [
  { label: '내부', value: '내부' },
  { label: '외부(개인)', value: '외부(개인)' },
  { label: '외부(공용)', value: '외부(공용)' },
]

const DELIVERY_OPTIONS = [
  { label: '많음', value: '많음' },
  { label: '보통', value: '보통' },
  { label: '적음', value: '적음' },
]

const TAKEOUT_OPTIONS = [
  { label: '많음', value: '많음' },
  { label: '보통', value: '보통' },
  { label: '적음', value: '적음' },
]

const formStep1 = reactive({ bNo: '', ownerName: '', openDt: '' })
const verified = reactive({ ok: false, bNo: '', ownerName: '', openDt: '' })

const formStep2 = reactive({
  industryMajor: '',
  industryMinor: '',
  dealType: '월세',
  deposit: null,
  rent: null,
  salePrice: null,
  premium: null,
  mgmtFee: null,
  transfer: { type: '협의', date: '' },
  storeName: '',      // ✅ 상호명
  shopType: '',
  area: { supply: null, exclusive: null },
  floor: { isBasement: false, current: null, total: null },
  parking: { type: '', count: null, paid: false },
  restroom: '',
  delivery: '',       // ✅ 배달
  takeout: '',        // ✅ 포장
  address: { base: '', detail: '', zip: '' },
})

const mgmtFeeWon = computed(() => manToKoreanWon(formStep2.mgmtFee))
const formStep3 = reactive({ description: '' })

const photos = ref([])
const MAX_PHOTOS = 5
const MIN_PHOTOS = 1
const canSubmit = computed(() => photos.value.length >= MIN_PHOTOS && photos.value.length <= MAX_PHOTOS)

function goStep(n) {
  step.value = n
}

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

function onBNoInput(e) {
  formStep1.bNo = onlyDigitsLen(e.target.value, 10)
}

function onOpenDtInput(e) {
  formStep1.openDt = onlyDigitsLen(e.target.value, 8)
}

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
  } catch {
    errorMsg.value = '서버 오류로 확인에 실패했습니다.'
  } finally {
    verifying.value = false
  }
}

function addAmount(field, delta) {
  const current = Number(formStep2[field] ?? 0) || 0
  const next = current + Number(delta || 0)
  formStep2[field] = Math.max(0, next)
}

function manToKoreanWon(num) {
  if (num === null || num === undefined || num === '') return ''
  const n = Number(num)
  if (Number.isNaN(n)) return ''
  if (n === 0) return '0원'

  let rest = Math.floor(n * 10000)
  const eok = Math.floor(rest / 100000000)
  rest %= 100000000
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

function onNextStep2() {
  const missing = []
  if (!formStep2.industryMajor) missing.push('업종(대분류)')
  if (!formStep2.industryMinor) missing.push('업종(중분류)')

  if (formStep2.dealType === '월세') {
    if (formStep2.deposit === null) missing.push('보증금')
    if (formStep2.rent === null) missing.push('월세')
  } else {
    if (formStep2.salePrice === null) missing.push('매매가')
  }

  if (!formStep2.transfer?.type) missing.push('양도가능일')
  if (formStep2.transfer?.type === '날짜' && !formStep2.transfer?.date) missing.push('양도가능일(날짜)')

  if (!formStep2.storeName) missing.push('상호명')
  if (!formStep2.shopType) missing.push('상가형태')
  if (formStep2.area.supply === null) missing.push('공급면적')
  if (formStep2.area.exclusive === null) missing.push('전용면적')
  if (formStep2.floor.current === null) missing.push('해당층')

  if (!formStep2.parking?.type) missing.push('주차 형태')
  if (formStep2.parking?.type && formStep2.parking.type !== '없음' && formStep2.parking.count === null) {
    missing.push('주차 대수')
  }

  if (!formStep2.restroom) missing.push('화장실')
  if (!formStep2.delivery) missing.push('배달')
  if (!formStep2.takeout) missing.push('포장')
  if (!formStep2.address.base) missing.push('기본주소')

  if (missing.length) {
    alert('다음 항목을 입력해주세요:\n- ' + missing.join('\n- '))
    return
  }
  goStep(3)
}

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
    biz: {
      bNo: verified.bNo,
      ownerName: verified.ownerName,
      openDt: verified.openDt
    },
    listing: {
      industry: `${formStep2.industryMajor}/${formStep2.industryMinor}`.replace(/\/$/, ''),
      dealType: formStep2.dealType,
      deposit: formStep2.dealType === '월세' ? formStep2.deposit : undefined,
      rent: formStep2.dealType === '월세' ? formStep2.rent : undefined,
      salePrice: formStep2.dealType === '매매' ? formStep2.salePrice : undefined,
      premium: formStep2.premium,
      mgmtFee: formStep2.mgmtFee,
      transfer: formStep2.transfer,
      storeName: formStep2.storeName,
      shopType: formStep2.shopType,
      area: {
        supply: formStep2.area.supply,
        exclusive: formStep2.area.exclusive
      },
      floor: {
        current: currentFloorNumber,
        total: Number(formStep2.floor.total || 0)
      },
      parking: formStep2.parking,
      restroom: restroomForDb,
      delivery: formStep2.delivery,
      takeout: formStep2.takeout,
      address: `${formStep2.address.base} ${formStep2.address.detail}`.trim()
    },
    description: formStep3.description,
  }
})

async function submitAll() {
  if (!photos.value || photos.value.length === 0) {
    alert('사진을 최소 1장 등록해 주세요.')
    return
  }

  try {
    const fd = new FormData()
    fd.append('data', JSON.stringify(payload.value))
    photos.value.forEach((f, i) =>
      fd.append('photos', f, f.name || `photo_${i}.jpg`)
    )

    const { data, headers } = await axios.post('/api/listings', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    let id =
      data?.id ??
      data?.listingId ??
      data?.result?.id ??
      data?.slug ??
      data?.data?.id ??
      data?.data?.slug
    if (!id && headers?.location) {
      const m = headers.location.match(/\/listing\/([^/?#]+)/)
      if (m) id = m[1]
    }

    alert('등록 완료')

    if (id) {
      await router.push({ name: 'listing-detail', params: { id } })
    } else if (headers?.location) {
      await router.push(headers.location)
    } else {
      await router.push({ name: 'listing-list' })
    }
  } catch {
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

.step > h2 {
  color: var(--color-primary);
  margin: 0 0 8px;
}

.desc {
  color: var(--color-darkgray);
  margin: 0 0 14px;
  line-height: 1.45;
}

.header-skip {
  background: transparent;
  border: 1px solid var(--color-lightgray);
  border-radius: 8px;
  padding: 6px 10px;
  line-height: 1;
  cursor: pointer;
}

.step {
  display: block;
}

.form {
  display: block;
}

.form > label {
  display: block;
  color: var(--color-primary);
  margin: 0;
}

.form > label + * {
  margin-top: 6px;
  margin-bottom: 18px;
}

.label-inline {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 6px;
}

.label-inline .label-right {
  margin-left: auto;
  color: var(--color-darkgray);
  text-align: right;
}

.deal-body .label-inline {
  justify-content: space-between;
}

.deal-body .label-inline .label-right {
  margin-left: 8px;
}

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

.textarea {
  resize: vertical;
}

.row {
  width: 100%;
  display: flex;
  gap: 8px;
}

.row.center {
  justify-content: center;
}

.row.gap {
  justify-content: space-between;
}

.submit-row {
  margin-top: 20px;
}

.error {
  color: var(--color-error);
}

.deal-card {
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  margin-bottom: 18px;
}

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

.deal-seg .seg-btn + .seg-btn {
  border-left: 1px solid var(--color-lightgray);
}

.deal-seg .seg-btn:hover {
  background: var(--color-primary-10);
}

.deal-seg .seg-btn.active {
  background: var(--color-primary-10);
  color: var(--color-primary);
  font-weight: 600;
}

.deal-body {
  padding: 12px;
}

.deal-body > label {
  margin-top: 2px;
}

.deal-body > label + * {
  margin-top: 6px;
}

.deal-body :deep(.number-button-group) {
  margin-top: 8px;
  margin-bottom: 12px;
}

.biz-kv {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin: 0 0 16px;
  padding: 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
}

.kv {
  display: grid;
  grid-template-columns: 110px 1fr;
  column-gap: 8px;
  align-items: center;
}

.kv-key {
  color: var(--color-lightblack);
}

.kv-val {
  color: var(--color-black);
}

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

.input-box:focus {
  border-color: var(--color-primary);
}

.input-box::placeholder {
  color: var(--color-mediumgray);
}

.step-photos {
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}
</style>
