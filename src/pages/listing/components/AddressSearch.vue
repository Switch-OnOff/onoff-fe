<template>
  <div class="addr-card">
    <!-- 우편번호 + 검색 버튼 -->
    <div class="row">
      <input
        class="input zip bodyMedium14px"
        :value="zonecode || ''"
        readonly
        placeholder="우편번호"
      />
      <button
        class="btn outline sm bodyMedium14px"
        type="button"
        @click="openPostcode"
        aria-label="주소 검색"
      >
        주소 검색
      </button>
    </div>

    <!-- 기본주소/ 검색 결과로만 채움 -->
    <input
      class="input"
      :value="baseAddress || ''"
      readonly
      placeholder="기본주소"
    />

    <!-- 상세주소/ 사용자가 직접 입력 -->
    <input
      class="input"
      :value="detailAddress || ''"
      placeholder="상세주소"
      @input="onDetail"
      ref="detailRef"
    />

    <p class="hint bodyRegular12px">
      지도 좌표는 기본주소 기준으로 설정됩니다. 표시용 주소는 기본+상세를 함께 사용하세요.
    </p>

    <!-- 모달: 다음(카카오) 우편번호 -->
    <div v-if="showPostcode" class="modal" role="dialog" aria-modal="true" aria-label="주소 검색">
      <div class="modal-sheet">
        <div class="modal-head">
          <strong class="title bodyMedium14px">주소 검색</strong>
          <button class="icon-btn bodyMedium16px" @click="closePostcode" aria-label="닫기">✕</button>
        </div>
        <div class="postcode-wrap" ref="postcodeEl"></div>
      </div>
      <div class="dim" @click="closePostcode" aria-hidden="true"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  baseAddress: String,
  detailAddress: String,
  zonecode: String,
})
const emit = defineEmits(['update:baseAddress', 'update:detailAddress', 'update:zonecode'])

const showPostcode = ref(false)
const postcodeEl = ref(null)
const detailRef = ref(null)

function onDetail(e){ emit('update:detailAddress', e.target.value) }

function ensureDaumPostcode() {
  return new Promise((resolve, reject) => {
    if (window.daum?.Postcode) return resolve(true)
    const id = 'daum-postcode-sdk'
    if (document.getElementById(id)) {
      const check = () => window.daum?.Postcode ? resolve(true) : setTimeout(check, 50)
      return check()
    }
    const s = document.createElement('script')
    s.id = id
    s.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    s.onload = () => resolve(true)
    s.onerror = () => reject(new Error('우편번호 스크립트를 불러오지 못했습니다.'))
    document.head.appendChild(s)
  })
}

async function openPostcode() {
  try {
    await ensureDaumPostcode()
    showPostcode.value = true
    await nextTick()
    const pc = new window.daum.Postcode({
      oncomplete: async (data) => {
        const addr = data.roadAddress || data.jibunAddress || ''
        emit('update:baseAddress', addr)
        emit('update:zonecode', data.zonecode || '')
        showPostcode.value = false
        await nextTick()
        detailRef.value?.focus()
      },
      width: '100%',
      height: '100%',
    })
    pc.embed(postcodeEl.value)
  } catch (e) {
    alert('주소 검색을 사용할 수 없습니다. 네트워크 상태를 확인해주세요.')
    showPostcode.value = false
  }
}
function closePostcode() { showPostcode.value = false }
</script>

<style scoped>
.addr-card {
  display: grid;
  gap: 8px;
}

/* 우편번호 + 버튼 한 줄 */
.row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

/* 인풋 공통 */
.input{
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-lightgray);
  border-radius: 12px;
  background: var(--color-white);
  font: inherit;
  box-sizing: border-box;
}
.input[readonly] {
  background: #fafafa;
  color: var(--color-lightblack);
}
.input:focus { border-color: var(--color-primary); outline: none; }

/* 우편번호 인풋 */
.input.zip { text-align: center; }

/* 버튼 */
.btn {
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border: 1px solid transparent;
  background: #fff;
}
.btn.outline {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.btn.outline:hover { background: var(--color-primary-10); }
.btn.outline:active { transform: translateY(0.5px); }

/* 스몰 사이즈 + 조금 더 길게 보이도록 최소 너비 */
.btn.sm {
  height: 40px;
  padding: 0 14px;
  min-width: 112px; /* ← 버튼 길이 확보 */
}

/* 힌트 */
.hint { color: var(--color-darkgray); }

/* ===== 모달(주소 검색) ===== */
.modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
}
.dim {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.35);
  backdrop-filter: blur(1px);
}
.modal-sheet {
  position: relative;
  z-index: 1;
  width: clamp(320px, 94vw, 520px);
  height: clamp(360px, 78dvh, 560px);
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  box-shadow: 0 6px 24px rgba(0,0,0,.18);
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-lightgray);
  background: #fff;
}
.title { color: var(--color-primary); }
.icon-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  line-height: 1;
  padding: 6px;
  border-radius: 12px;
}
.icon-btn:hover { background: rgba(0,0,0,.06); }
.postcode-wrap { width: 100%; height: 100%; }
</style>
