import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api.js';
import { normalizePhoneVN } from '../utils/phone.js';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      points: 0,
      level: 1,
      
      // Profile fields cho Safety Passport
      profile: {
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        location: 'KCN PouYuen',
        zaloVerified: true,
        passportSerial: 'LP-008892',
        badges: [
          { code: 'safety_knight', label: 'Hiệp sĩ An toàn số 🛡️', earnedAt: '2026-09-15' },
          { code: 'craft_master', label: 'Bàn tay vàng Thủ công 🧶', earnedAt: '2026-09-20' },
          { code: 'finance_wise', label: 'Chi tiêu Thông thái 💡', earnedAt: '2026-10-01' },
        ],
      },

      setAuth: (user, token) => {
        const points = user?.points || 0;
        const level = user?.level || 1;
        set({ user, token, points, level });
      },
      logout: () => set({ user: null, token: null, points: 0, level: 1 }),
      setPoints: (points) => set({ points }),
      setProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),

      /**
       * Đăng nhập qua /api/auth/login.
       * SĐT sẽ được chuẩn hoá trước khi gửi (chấp nhận +84, có dấu cách/gạch, thiếu số 0).
       * Trả về user để caller check role.
       * Throw error nếu thất bại.
       */
      login: async (phone, password) => {
        const normalized = normalizePhoneVN(String(phone || '').trim());
        const { data } = await api.post('/auth/login', {
          phone: normalized,
          password,
        });
        const points = data.user?.points || 0;
        const level = data.user?.level || 1;
        set({ user: data.user, token: data.token, points, level });
        return data.user;
      },
    }),
    {
      name: 'loom-auth',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        points: state.points,
        level: state.level,
      }),
    }
  )
);