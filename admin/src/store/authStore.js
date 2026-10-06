import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api.js';
import { normalizePhoneVN } from '../utils/phone.js';

/**
 * Store auth RIÊNG cho admin — storage key tách biệt với frontend user
 * (loom-admin-api-auth vs loom-auth).
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null });
        // xoá cả key của admin để interceptor 401 không redirect lại
        try { localStorage.removeItem('loom-admin-api-auth'); } catch (_) {}
      },

      login: async (phone, password) => {
        const normalized = normalizePhoneVN(String(phone || '').trim());
        const { data } = await api.post('/auth/login', {
          phone: normalized,
          password,
        });
        set({ user: data.user, token: data.token });
        return data.user;
      },
    }),
    {
      name: 'loom-admin-api-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);