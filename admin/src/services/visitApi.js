import api from './api.js';

/**
 * Lấy dữ liệu thống kê truy cập tổng hợp.
 * @param {'day'|'month'|'year'} granularity
 */
export const fetchVisitStats = ({ granularity = 'day', from, to } = {}) =>
  api
    .get('/admin/visits/stats', {
      params: { granularity, ...(from ? { from } : {}), ...(to ? { to } : {}) },
    })
    .then((r) => r.data);

export const fetchRecentVisits = (limit = 50) =>
  api
    .get('/admin/visits/recent', { params: { limit } })
    .then((r) => r.data.items || []);