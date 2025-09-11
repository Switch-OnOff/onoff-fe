<template>
  <div class="wizard-page">
    <SimpleHeader :show-button="false" title="매물 등록"/>
      <!-- <template #action>
        <button
          v-if="step < 4"
          type="button"
          class="header-skip bodyMedium14px"
          @click="skipToNext"
        >
          다음(건너뛰기)
        </button>
      </template>
    </SimpleHeader> -->

    <!-- STEP 1 -->
    <section class="step" v-if="step === 1">
      <h2 class="titleExtra28px">사업자 진위확인</h2>
      <p class="desc bodyRegular12px">
        국세청 진위확인으로 사업자 정보를 확인합니다.
        등록번호(10자리)·대표자명·개업일자를 입력하세요.
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
                @add="(v) => addAmount('deposit', v)"
              />

              <label class="bodyMedium14px label-inline">
                월세(만원)
                <span v-if="rentWon" class="label-right bodyRegular12px">{{ rentWon }}</span>
              </label>
              <MoneyInput v-model.number="formStep2.rent" />
              <NumberButtonGroup
                :labels="['10만원', '100만원', '1천만원', '1억']"
                :amounts="[10, 100, 1000, 10000]"
                @add="(v) => addAmount('rent', v)"
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
                @add="(v) => addAmount('salePrice', v)"
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
          @add="(v) => addAmount('premium', v)"
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
      <p class="desc-secondary bodyRegular12px">
        간단한 키워드나 짧은 문장만 입력하셔도 됩니다. 입력하신 내용과 기본 정보(업종, 거래유형, 금액, 면적, 층, 주차, 주소, 양도 가능일 등)를 함께 반영하여
        문장을 자연스럽게 정리한 <strong>완성형 소개글</strong>로 다듬어 드립니다. 생성 후 직접 수정하실 수 있습니다.
      </p>

      <textarea
        class="textarea bodyRegular14px"
        rows="8"
        v-model="formStep3.description"
        placeholder="예시: 대학가·오피스 혼재 상권, 점심 피크 매출 우수, 최근 전체 인테리어, 주차 3대 가능 등 키워드를 자유롭게 적어주세요."
      ></textarea>

      <div class="ai-help">
        <div class="ai-tip bodyRegular12px">
          ✦ 예시: <em>대학가 상권</em>, <em>오피스 밀집</em>, <em>점심 피크</em>, <em>유동인구 많음</em>, <em>주차 3대</em>, <em>최근 전체 인테리어</em>, <em>배달 강세</em>, <em>포장 매출 우수</em>, <em>코너자리</em>, <em>1층 로드샵</em>, <em>가시성 우수</em>, <em>이중출입문</em>, <em>테라스 좌석</em>, <em>환기 우수</em>, <em>정남향</em>
        </div>
      </div>

      <!-- 버튼: 위(흰 배경) / 아래(프라이머리) -->
      <div class="submit-vertical">
        <MedSubmitBtn
          :text="aiLoading ? '수정중' : 'AI로 글 다듬기'"
          :color="'var(--color-white)'"              
          :disabled="aiLoading || !formStep3.description?.trim()"
          @click="generateContent"
        />
        <MedSubmitBtn
          text="등록하기"                           
          @click="goStep(4)"
        />
      </div>
    </section>

    <!-- STEP 4 -->
    <section class="step step-photos" v-else-if="step === 4">
      <h2 class="titleExtra28px">사진 등록 (1~5장)</h2>

      <PhotoUploader v-model="photos" :max="5" :min="1" :capture="true" />

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

    <AlertModal
      v-model:open="modal.open"
      :title="modal.title"
      :message="modal.message"
      :confirmText="modal.confirmText"
      @confirm="handleModalConfirm"
      @close="modal.open = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

import SimpleHeader from '@/components/layout/SimpleHeader.vue';
import MedSubmitBtn from '@/components/button/MedSubmitBtn.vue';
import InputField from '@/components/input/InputField.vue';
import InputSimple from '@/components/input/InputSimple.vue';

import IndustryPicker from '@/pages/listing/components/IndustryPicker.vue';
import MoneyInput from '@/pages/listing/components/MoneyInput.vue';
import AreaInput from '@/pages/listing/components/AreaInput.vue';
import TransferDateField from '@/pages/listing/components/TransferDateField.vue';
import AddressSearch from '@/pages/listing/components/AddressSearch.vue';
import NumberButtonGroup from '@/components/input/NumberButtonGroup.vue';
import FloorInput from '@/pages/listing/components/FloorInput.vue';
import ParkingCard from '@/pages/listing/components/ParkingCard.vue';
import SelectField from '@/pages/listing/components/DropDown.vue';
import PhotoUploader from '@/pages/listing/components/PhotoUploader.vue';
import AlertModal from '@/components/modal/AlertModal.vue';

const step = ref(1);
const verifying = ref(false);
const errorMsg = ref('');
const aiLoading = ref(false);
const router = useRouter();

const modal = reactive({
  open: false,
  title: '알림',
  message: '',
  confirmText: '확인',
  onConfirm: null,
});
function showModal(message, opts = {}) {
  modal.title = opts.title ?? '알림';
  modal.message = message;
  modal.confirmText = opts.confirmText ?? '확인';
  modal.onConfirm = typeof opts.onConfirm === 'function' ? opts.onConfirm : null;
  modal.open = true;
}
function handleModalConfirm() {
  const fn = modal.onConfirm;
  modal.open = false;
  if (fn) fn();
}

const INDUSTRY_CATEGORIES = [
  { major: '일반음식점', minors: ['한식', '중식', '양식', '분식', '치킨', '카페/디저트'] },
  { major: '서비스업', minors: ['미용', '세탁', '교육', '기타'] },
  { major: '소매', minors: ['편의점', '잡화', '의류', '기타'] },
];

const SHOP_TYPES = [
  { label: '근린상가', value: '근린상가' },
  { label: '로데오/먹자골목', value: '로데오/먹자골목' },
  { label: '오피스상권', value: '오피스상권' },
  { label: '주상복합', value: '주상복합' },
  { label: '몰/쇼핑센터', value: '몰/쇼핑센터' },
  { label: '기타/확인필요', value: '기타/확인필요' },
];

const RESTROOM_OPTIONS = [
  { label: '내부', value: '내부' },
  { label: '외부(개인)', value: '외부(개인)' },
  { label: '외부(공용)', value: '외부(공용)' },
];

const DELIVERY_OPTIONS = [
  { label: '많음', value: '많음' },
  { label: '보통', value: '보통' },
  { label: '적음', value: '적음' },
];

const TAKEOUT_OPTIONS = [
  { label: '많음', value: '많음' },
  { label: '보통', value: '보통' },
  { label: '적음', value: '적음' },
];

const formStep1 = reactive({ bNo: '', ownerName: '', openDt: '' });
const verified = reactive({ ok: false, bNo: '', ownerName: '', openDt: '' });

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
  storeName: '',
  shopType: '',
  area: { supply: null, exclusive: null },
  floor: { isBasement: false, current: null, total: null },
  parking: { type: '', count: null, paid: false },
  restroom: '',
  delivery: '',
  takeout: '',
  address: { base: '', detail: '', zip: '' },
});

const mgmtFeeWon = computed(() => manToKoreanWon(formStep2.mgmtFee));
const formStep3 = reactive({ description: '' });

const photos = ref([]);
const MAX_PHOTOS = 5;
const MIN_PHOTOS = 1;
const canSubmit = computed(
  () => photos.value.length >= MIN_PHOTOS && photos.value.length <= MAX_PHOTOS
);

function goStep(n) { step.value = n; }
function skipToNext() {
  if (step.value === 1) {
    verified.bNo = formStep1.bNo;
    verified.ownerName = formStep1.ownerName;
    verified.openDt = formStep1.openDt;
    verified.ok = false;
  }
  if (step.value < 4) step.value += 1;
}

function onlyDigitsLen(val, max) {
  return String(val || '').replace(/\D/g, '').slice(0, max);
}
function onBNoInput(e) { formStep1.bNo = onlyDigitsLen(e.target.value, 10); }
function onOpenDtInput(e) { formStep1.openDt = onlyDigitsLen(e.target.value, 8); }

async function onVerify() {
  errorMsg.value = '';
  verifying.value = true;
  try {
    const res = await axios.post(
      'http://localhost:8080/api/property/validate',
      {
        b_no: formStep1.bNo.replace(/\D/g, ''),
        p_nm: formStep1.ownerName.trim(),
        start_dt: formStep1.openDt.replace(/\D/g, ''),
      }
    );
    const valid = res?.data?.data === true;
    if (valid) {
      verified.ok = true;
      verified.bNo = formStep1.bNo;
      verified.ownerName = formStep1.ownerName;
      verified.openDt = formStep1.openDt;
      goStep(2);
    } else {
      errorMsg.value = '진위확인 실패';
      showModal(
        [
          '사업자 진위확인에 실패했습니다.',
          '입력하신 정보를 다시 확인해 주세요.',
          '',
          '• 등록번호: 숫자 10자리',
          '• 대표자명: 띄어쓰기 포함 정확히',
          '• 개업일자: YYYYMMDD 형식',
        ].join('\n'),
        { title: '진위확인 실패' }
      );
    }
  } catch {
    showModal('서버 오류로 확인에 실패했습니다.\n잠시 후 다시 시도해 주세요.', {
      title: '진위확인 오류',
    });
  } finally {
    verifying.value = false;
  }
}

function addAmount(field, delta) {
  const current = Number(formStep2[field] ?? 0) || 0;
  const next = current + Number(delta || 0);
  formStep2[field] = Math.max(0, next);
}

function manToKoreanWon(num) {
  if (num === null || num === undefined || num === '') return '';
  const n = Number(num);
  if (Number.isNaN(n)) return '';
  if (n === 0) return '0원';
  let rest = Math.floor(n * 10000);
  const eok = Math.floor(rest / 100000000);
  rest %= 100000000;
  const man = Math.floor(rest / 10000);
  const won = rest % 10000;
  const parts = [];
  if (eok) parts.push(`${eok}억`);
  if (man) parts.push(`${man}만`);
  if (won) parts.push(`${won.toLocaleString()}원`);
  if (!won) parts.push('원');
  return parts.join(' ').trim();
}

const depositWon = computed(() => manToKoreanWon(formStep2.deposit));
const rentWon = computed(() => manToKoreanWon(formStep2.rent));
const saleWon = computed(() => manToKoreanWon(formStep2.salePrice));
const premiumWon = computed(() => manToKoreanWon(formStep2.premium));

function onNextStep2() {
  const missing = [];
  if (!formStep2.industryMajor) missing.push('업종(대분류)');
  if (!formStep2.industryMinor) missing.push('업종(중분류)');

  if (formStep2.dealType === '월세') {
    if (formStep2.deposit === null) missing.push('보증금');
    if (formStep2.rent === null) missing.push('월세');
  } else {
    if (formStep2.salePrice === null) missing.push('매매가');
  }

  if (!formStep2.transfer?.type) missing.push('양도가능일');
  if (formStep2.transfer?.type === '날짜' && !formStep2.transfer?.date) missing.push('양도가능일(날짜)');

  if (!formStep2.storeName) missing.push('상호명');
  if (!formStep2.shopType) missing.push('상가형태');
  if (formStep2.area.supply === null) missing.push('공급면적');
  if (formStep2.area.exclusive === null) missing.push('전용면적');
  if (formStep2.floor.current === null) missing.push('해당층');

  if (!formStep2.parking?.type) missing.push('주차 형태');
  if (formStep2.parking?.type && formStep2.parking.type !== '없음' && formStep2.parking.count === null) {
    missing.push('주차 대수');
  }

  if (!formStep2.restroom) missing.push('화장실');
  if (!formStep2.delivery) missing.push('배달');
  if (!formStep2.takeout) missing.push('포장');
  if (!formStep2.address.base) missing.push('기본주소');

  if (missing.length) {
    showModal('다음 항목을 입력해주세요:\n- ' + missing.join('\n- '), { title: '입력 누락' });
    return;
  }
  goStep(3);
}

const payload = computed(() => {
  const restroomForDb = (() => {
    if (formStep2.restroom === '외부(공용)') return '공용';
    if (formStep2.restroom === '외부(개인)') return '개인';
    return formStep2.restroom;
  })();

  const currentFloorNumber = formStep2.floor?.isBasement
    ? -Math.abs(Number(formStep2.floor?.current ?? 1))
    : Number(formStep2.floor?.current ?? 0);

  const isMonthly = formStep2.dealType === '월세';
  const isSale = formStep2.dealType === '매매';

  const transferDateISO = formStep2.transfer?.date
    ? new Date(formStep2.transfer.date).toISOString()
    : null;

  const base = {
    userId: JSON.parse(sessionStorage.getItem('user') || '{}').userId,
    storeName: formStep2.storeName?.trim() ?? '',
    industry: `${formStep2.industryMajor ?? ''}/${formStep2.industryMinor ?? ''}`.replace(/\/$/, ''),
    shopType: formStep2.shopType ?? '',
    transferType: formStep2.transfer?.type ?? '',
    transferDate: transferDateISO,
    currentFloor: currentFloorNumber,
    totalFloor: Number(formStep2.floor?.total ?? 0),
    parkingType: formStep2.parking?.type ?? '없음',
    parkingCount: Number(formStep2.parking?.count ?? 0),
    parkingPaid: Boolean(formStep2.parking?.paid ?? false),
    restroom: restroomForDb,
    deliveryLevel: formStep2.delivery ?? '',
    takeoutLevel: formStep2.takeout ?? '',
    supplyArea: Number(formStep2.area?.supply ?? 0),
    exclusiveArea: Number(formStep2.area?.exclusive ?? 0),
    description: (formStep3.description ?? '').trim(),
    transactionType: formStep2.dealType ?? '',
    deposit: isMonthly ? Number(formStep2.deposit ?? 0) : null,
    mgmtFee: Number(formStep2.mgmtFee ?? 0),
    premium: Number(formStep2.premium ?? 0),
    rent: isMonthly ? Number(formStep2.rent ?? 0) : null,
    salePrice: isSale ? Number(formStep2.salePrice ?? 0) : null,
    address: `${formStep2.address?.base ?? ''} ${formStep2.address?.detail ?? ''}`.trim(),
  };
  return Object.fromEntries(Object.entries(base).filter(([, v]) => v !== null && v !== undefined));
});

const propertyId = ref(null);

async function createListing() {
  try {
    const res = await axios.post('http://localhost:8080/api/property/', payload.value);
    const id = typeof res?.data?.data === 'number' ? res.data.data : res?.data?.id ?? null;
    propertyId.value = id;
    return id;
  } catch (e) {
    propertyId.value = null;
    throw e;
  }
}

async function createPropertyImg(propertyId) {
  try {
    const userId = sessionStorage.getItem('user')
      ? JSON.parse(sessionStorage.getItem('user')).userId
      : null;
    if (!userId) throw new Error('userId가 없습니다. 로그인 상태를 확인하세요.');

    const formData = new FormData();
    formData.append('content', '이미지 저장');
    formData.append('propertyId', String(propertyId));
    (photos.value || []).forEach((f) => formData.append('images', f));

    const res = await axios.post(
      `http://localhost:8080/api/posts/${userId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  } catch (err) {
    console.error('게시글 등록 실패:', err);
    throw err;
  }
}

async function submitAll() {
  if (!photos.value || photos.value.length === 0) {
    showModal('사진을 최소 1장 등록해 주세요.', { title: '사진 등록' });
    return;
  }

  try {
    const id = await createListing();
    await createPropertyImg(id);
    showModal('등록 완료', {
      title: '완료',
      onConfirm: () => {
        if (id) router.push({ name: 'listing-detail', params: { id } });
        else router.push({ name: 'listing-list' });
      },
    });
  } catch {
    showModal('등록 실패. 잠시 후 다시 시도해주세요.', { title: '오류' });
  }
}

function addPhrase(text) {
  const cur = (formStep3.description || '').trim();
  formStep3.description = cur ? `${cur}\n${text}` : text;
}

function togglePhrase(text) {
  const cur = (formStep3.description || '').trim();
  const lines = cur ? cur.split('\n').map(s => s.trim()).filter(Boolean) : [];
  const i = lines.indexOf(text);
  if (i >= 0) lines.splice(i, 1);
  else lines.push(text);
  formStep3.description = lines.join('\n');
}

function formatTransfer() {
  if (!formStep2.transfer?.type) return '';
  if (formStep2.transfer.type === '날짜' && formStep2.transfer.date) {
    try {
      const d = new Date(formStep2.transfer.date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `양도가능일: ${y}.${m}.${day}`;
    } catch { return `양도가능일: ${formStep2.transfer.date}`; }
  }
  return `양도가능일: ${formStep2.transfer.type}`;
}

function buildContextLines() {
  const lines = [];
  const ind = [formStep2.industryMajor, formStep2.industryMinor].filter(Boolean).join(' / ');
  if (ind) lines.push(`업종: ${ind}`);
  if (formStep2.dealType === '월세') {
    if (formStep2.deposit != null) lines.push(`보증금: ${manToKoreanWon(formStep2.deposit)}`);
    if (formStep2.rent != null) lines.push(`월세: ${manToKoreanWon(formStep2.rent)}`);
  } else {
    if (formStep2.salePrice != null) lines.push(`매매가: ${manToKoreanWon(formStep2.salePrice)}`);
  }
  if (formStep2.premium != null) lines.push(`권리금: ${manToKoreanWon(formStep2.premium)}`);
  if (formStep2.mgmtFee != null) lines.push(`관리비: ${manToKoreanWon(formStep2.mgmtFee)}`);
  if (formStep2.storeName) lines.push(`상호명: ${formStep2.storeName}`);
  if (formStep2.shopType) lines.push(`상가형태: ${formStep2.shopType}`);
  const areas = [];
  if (formStep2.area.supply != null) areas.push(`공급 ${formStep2.area.supply}㎡`);
  if (formStep2.area.exclusive != null) areas.push(`전용 ${formStep2.area.exclusive}㎡`);
  if (areas.length) lines.push(`면적: ${areas.join(', ')}`);
  const floorTxt = [];
  if (formStep2.floor.current != null) {
    const f = formStep2.floor.isBasement ? `지하 ${Math.abs(formStep2.floor.current)}층` : `${formStep2.floor.current}층`;
    floorTxt.push(f);
  }
  if (formStep2.floor.total != null) floorTxt.push(`(총 ${formStep2.floor.total}층)`);
  if (floorTxt.length) lines.push(`층: ${floorTxt.join(' ')}`);
  if (formStep2.parking?.type) {
    let p = `주차: ${formStep2.parking.type}`;
    if (formStep2.parking.type !== '없음' && formStep2.parking.count != null) p += `, ${formStep2.parking.count}대`;
    if (formStep2.parking.type !== '없음') p += formStep2.parking.paid ? ', 유료' : ', 무료';
    lines.push(p);
  }
  if (formStep2.restroom) lines.push(`화장실: ${formStep2.restroom}`);
  if (formStep2.delivery) lines.push(`배달: ${formStep2.delivery}`);
  if (formStep2.takeout) lines.push(`포장: ${formStep2.takeout}`);
  const addr = [formStep2.address.base, formStep2.address.detail].filter(Boolean).join(' ');
  if (addr) lines.push(`주소: ${addr}`);
  const t = formatTransfer();
  if (t) lines.push(t);
  return lines;
}

async function generateContent() {
  try {
    const text = (formStep3.description || '').trim();
    if (!text) {
      showModal('내용을 입력해 주세요.', { title: '안내' });
      return;
    }
    aiLoading.value = true;

    const userSentences = text.split('\n').map(s => s.trim()).filter(Boolean);
    const contextLines = buildContextLines();

    const res = await axios.post(
      'http://localhost:8080/api/ghostwrite/generate',
      {
        sentences: [...contextLines, '---', ...userSentences],
        tone: '담백하고 신뢰감 있는 문장',
        style: '상업용 점포 소개',
      }
    );

    const out = res?.data?.data;
    if (typeof out === 'string' && out.trim().length > 0) {
      formStep3.description = out.trim();
      showModal('AI가 내용을 다듬었습니다. 확인해 주세요.', { title: '완료' });
    } else {
      showModal('생성 결과가 비어 있습니다. 다시 시도해 주세요.', { title: '안내' });
    }
  } catch (err) {
    console.error(err);
    showModal('글 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.', { title: '오류' });
  } finally {
    aiLoading.value = false;
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

.step { display: block; }
.form { display: block; }

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

.deal-body .label-inline { justify-content: space-between; }
.deal-body .label-inline .label-right { margin-left: 8px; }

.input,
.textarea,
select {
  width: 100%;
  height: 20rem;
  padding: 10px 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: #fff;
  letter-spacing: -0.03em;
}
.textarea { resize: vertical; }

.row { width: 100%; display: flex; gap: 8px; }
.row.center { justify-content: center; }
.row.gap { justify-content: space-between; }
.submit-row { margin-top: 20px; }

.error { color: var(--color-error); }

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
  transition: background 0.15s ease, color 0.15s ease;
}
.deal-seg .seg-btn + .seg-btn { border-left: 1px solid var(--color-lightgray); }
.deal-seg .seg-btn:hover { background: var(--color-primary-10); }
.deal-seg .seg-btn.active {
  background: var(--color-primary-10);
  color: var(--color-primary);
  font-weight: 600;
}

.deal-body { padding: 12px; }
.deal-body > label { margin-top: 2px; }
.deal-body > label + * { margin-top: 6px; }
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
.kv-key { color: var(--color-lightblack); }
.kv-val { color: var(--color-black); }

.input-box {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: 1px solid var(--color-lightgray);
  padding: 0 16px;
  box-sizing: border-box;
  background: var(--color-white);
  transition: border 0.2s;
}
.input-box:focus { border-color: var(--color-primary); }
.input-box::placeholder { color: var(--color-mediumgray); }

.step-photos { margin-left: 0rem; margin-right: 0rem; }

/* 추가 */
.desc-secondary {
  color: var(--color-darkgray);
  margin: 0 0 12px;
  line-height: 1.5;
}
.ai-help { display: grid; gap: 8px; margin: 0 0 10px; }
.ai-tip {
  background: var(--color-primary-10);
  border: 1px solid var(--color-lightgray);
  border-radius: 10px;
  padding: 8px 10px;
  color: var(--color-darkgray);
}
.chip-list { display: flex; flex-wrap: wrap; gap: 8px; }
.chip-list.wrap { flex-wrap: wrap; }
.chip {
  border: 1px solid var(--color-lightgray);
  background: #fff;
  border-radius: 999px;
  padding: 6px 10px;
  line-height: 1;
  cursor: pointer;
  font-size: 12px;
  transition: background .15s ease, border-color .15s ease;
}
.chip:hover { background: var(--color-primary-10); border-color: var(--color-primary); }
.under-textarea { margin-top: 10px; }

/* 2분할 버튼 */
.submit-row.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}
.submit-row.two .col { width: 50%; }

.submit-vertical {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 14px;
}
</style>
