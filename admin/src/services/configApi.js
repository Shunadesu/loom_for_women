import api from './api.js';

// Admin-only — cấu hình chung (config singleton).
// Lưu ý: instance `api` có baseURL = '/api', nên route admin phải có tiền tố '/admin'.

/** Đọc config hiện tại (dùng endpoint public GET /api/config). */
export const fetchConfig = () => api.get('/config').then((r) => r.data.config);

/** Upload / thay logo. Field multipart tên 'logo'. */
export const uploadLogo = (file) => {
  const fd = new FormData();
  fd.append('logo', file);
  return api
    .put('/admin/config/logo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.config);
};

/** Xoá logo → quay về logo mặc định /logo.png. */
export const deleteLogo = () =>
  api.delete('/admin/config/logo').then((r) => r.data.config);
