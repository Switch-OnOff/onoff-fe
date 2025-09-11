import { api, unwrap } from './client';

export function searchLoans(keywordOrOpts) {
  const params =
    typeof keywordOrOpts === 'string' || keywordOrOpts == null
      ? { keyword: keywordOrOpts }
      : { ...keywordOrOpts };
  return api.get('/api/loan/search', { params }).then(unwrap);
}

export function filterLoans({
  eligibleGroup,
  loanType,
  interestType,
  repaymentMethod,
} = {}) {
  return api
    .get('/api/loan/filter', {
      params: { eligibleGroup, loanType, interestType, repaymentMethod },
    })
    .then(unwrap);
}

export function getLoanDetail(loanId) {
  return api.get(`/api/loan/${loanId}`).then(unwrap);
}

export function evaluateLoan(loanId, body) {
  // body: { creditScore, loanAmount, repaymentMonths, income, repayRatio }
  return api.post(`/api/loan/${loanId}/evaluate`, body).then((res) => res.data);
}

export function getTop5Loans() {
  return api.get('/api/loan/top5').then(unwrap);
}
