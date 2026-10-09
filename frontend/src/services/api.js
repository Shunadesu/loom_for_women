import axios from 'axios';

const api = axios.create({
  // Để relative '/api' để request đi qua Vite proxy ở local dev
  // (xem vite.config.js). Proxy sẽ forward sang backend thật (sunnydemo.site
  // hoặc localhost:3010 tuỳ env). Production build thường dùng URL tuyệt đối
  // (xem .env.production).
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  try {
    const auth = JSON.parse(localStorage.getItem('loom-auth') || '{}');
    if (auth?.state?.token) {
      config.headers.Authorization = `Bearer ${auth.state.token}`;
    }
  } catch (_) {}
  return config;
});

export default api;