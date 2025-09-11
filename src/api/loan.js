import { api, unwrap } from './client';

export function filterLoans({
  eligibleGroup,
  loanType,
  interestType,
  repaymentMethod,
}) {
  return api
    .get('/api/loan/filter', {
      params: { eligibleGroup, loanType, interestType, repaymentMethod },
    })
    .then(unwrap);
}

export function getLoanDetail(loanId) {
  return api.get(`/api/loan/${loanId}`).then(unwrap);
}

export function evaluateLoan(
  loanId,
  { creditScore, loanAmount, repaymentMonths, income, repayRatio }
) {
  return api
    .post(`/api/loan/${loanId}/evaluate`, {
      creditScore,
      loanAmount,
      repaymentMonths,
      income,
      repayRatio,
    })
    .then((res) => res.data); // 이건 래핑 없이 예시가 있어서 그대로
}

export function getTop5Loans() {
  return api.get('/api/loan/top5').then(unwrap);
}
