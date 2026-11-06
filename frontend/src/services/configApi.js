import api from './api.js';

/** Lấy config singleton từ backend (public endpoint). */
export const fetchConfig = () => api.get('/config').then((r) => r.data.config);
