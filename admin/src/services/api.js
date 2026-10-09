import axios from 'axios';

/**
 * Axios instance RIÊNG cho trang admin.
 * - baseURL: dùng đường dẫn tương đối '/api' → đi qua Vite proxy → backend.
 *   Khi deploy, Vite build ra static file cùng domain với backend, '/api' vẫn đúng.
 * - Storage key RIÊNG ('loom-admin-api-auth') → không xung đột với frontend user.
 * - Khi deploy lên Vercel, set VITE_API_URL trong Project Settings → Environment Variables.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('loom-admin-api-auth');
    if (raw) {
      const auth = JSON.parse(raw);
      if (auth?.state?.token) {
        config.headers.Authorization = `Bearer ${auth.state.token}`;
      }
    }
  } catch (_) {}
  return config;
});

// 401 → đẩy về login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      // tránh loop nếu đang ở trang login
      if (!window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('loom-admin-api-auth');
        window.location.replace('/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;