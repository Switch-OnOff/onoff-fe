import { api, unwrap } from './client';

export function searchGrants(keywordOrOpts) {
  const params =
    typeof keywordOrOpts === 'string' || keywordOrOpts == null
      ? { keyword: keywordOrOpts }
      : { ...keywordOrOpts };
  return api.get('/api/grants/search', { params }).then(unwrap);
}

export function filterGrants({ serviceStatus, location, industry } = {}) {
  return api
    .get('/api/grants/filter', {
      params: { serviceStatus, location, industry },
    })
    .then(unwrap);
}

export function getGrantDetail(serviceId) {
  return api.get(`/api/grants/${serviceId}`).then(unwrap);
}

export function getGrantChecklist(serviceId) {
  return api.get(`/api/grants/${serviceId}/checkList`).then(unwrap);
}

export function validateGrant(
  serviceId,
  { serviceStatus, location, industry }
) {
  return api
    .post(`/api/grants/${serviceId}/validate`, {
      serviceStatus,
      location,
      industry,
    })
    .then(unwrap);
}

export function getTop5Grants() {
  return api.get('/api/grants/top5').then(unwrap);
}
