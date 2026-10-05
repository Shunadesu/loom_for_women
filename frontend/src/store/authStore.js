import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api.js';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: { name: 'Bạn của Loom' },
      token: null,
      // Số điểm thưởng hiển thị ở header — mock ban đầu, sẽ sync từ API sau
      points: 480,
      level: 2,

      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setPoints: (points) => set({ points }),

      /**
       * Đăng nhập qua /api/auth/login.
       * Trả về user để caller check role.
       * Throw error nếu thất bại.
       */
      login: async (phone, password) => {
        const { data } = await api.post('/auth/login', { phone, password });
        set({ user: data.user, token: data.token });
        return data.user;
      },
    }),
    {
      name: 'loom-auth',
      // Chỉ persist user + token — không cần lưu function
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);