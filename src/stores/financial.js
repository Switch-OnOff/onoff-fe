import { defineStore } from 'pinia';

const STORAGE_KEY = 'financial-store-v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}
function save(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export const useFinancialStore = defineStore('financial', {
  state: () => ({
    mode: load()?.mode ?? null,

    // 🔹 검색어 (목록 상단 공통 검색창에서 사용)
    search: load()?.search ?? '',

    // 🔹 지원금 목록 필터 (SupportFilterPanel에서 사용)
    supportFilters: load()?.supportFilters ?? {
      status: '', // '예비창업자' | '영업 중' | '생계 곤란/폐업 예정자'
      sido: '', // '서울특별시' 등
      sigungu: '', // '강남구' 등
      industry: '', // '음식점업' | '제조업' | '기타'
    },

    support: {
      basic: load()?.support?.basic ?? {
        status: '',
        location: '',
        industry: '',
      },
      criteria: load()?.support?.criteria ?? {
        hasBusinessReg: false,
        noRecentPenalty: false,
        meetsScale: false,
      },
      docs: load()?.support?.docs ?? {
        regCopy: false,
        salesProof: false,
        originCert: false,
      },
    },

    loan: {
      basic: load()?.loan?.basic ?? {
        creditScore: null,
        monthlyIncome: null,
        desiredAmount: null,
      },
    },
  }),

  getters: {
    modeLabel: (s) =>
      s.mode === 'support' ? '지원금' : s.mode === 'loan' ? '대출' : '선택',
    searchPlaceholder: (s) =>
      s.mode === 'support'
        ? '지원금을 검색해보세요 (예: 청년창업, 임차료)'
        : s.mode === 'loan'
        ? '대출을 검색해보세요 (예: 사업자대출, 금리)'
        : '지원금/대출을 먼저 선택하세요',
  },

  actions: {
    setMode(m) {
      this.mode = m;
      // 모드 바뀔 때 서로 상태 충돌 방지용 초기화
      if (m === 'support') {
        this.resetLoan();
      } else if (m === 'loan') {
        this.resetSupport();
        this.resetSupportFilters(); // 🔹 지원금 필터도 같이 정리
      }
    },

    // 🔹 필터 리셋
    resetSupportFilters() {
      this.supportFilters = { status: '', sido: '', sigungu: '', industry: '' };
    },

    resetSupport() {
      this.support.basic = { status: '', location: '', industry: '' };
      this.support.criteria = {
        hasBusinessReg: false,
        noRecentPenalty: false,
        meetsScale: false,
      };
      this.support.docs = {
        regCopy: false,
        salesProof: false,
        originCert: false,
      };
    },

    resetLoan() {
      this.loan.basic = {
        creditScore: null,
        monthlyIncome: null,
        desiredAmount: null,
      };
    },
  },
});

export function persistFinancial(store = useFinancialStore()) {
  store.$subscribe((_mut, state) => save(state));
}
