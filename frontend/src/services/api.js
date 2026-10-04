import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3010/api',
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