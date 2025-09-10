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
      if (m === 'support') this.resetLoan();
      if (m === 'loan') this.resetSupport();
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

/* very small persist */
export function persistFinancial(store = useFinancialStore()) {
  store.$subscribe((_mut, state) => save(state));
}
