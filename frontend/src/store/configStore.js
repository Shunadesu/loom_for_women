import { create } from 'zustand';

// Mock config — sẽ thay bằng API thật khi backend ready
const MOCK_CONFIG = {
  welcomeTitle: 'Đem an toàn và hy vọng',
  welcomeDesc:
    'Cùng Loom for Women mang đến sự an toàn, hy vọng và tương lai tốt đẹp cho lao động nữ.',
  welcomeBtn: 'Bắt Đầu',
  registerTitle: 'Đăng Ký Tài Khoản',
  registerSubtitle: 'Tạo tài khoản mới cùng Loom',
  registerBtn: 'Đăng Ký Ngay',
  loginBtn: 'Đăng Nhập',
  laterBtn: 'Để sau',
  themeColor: '#E60067',
  primaryShade: 600,
};

export const useConfigStore = create((set) => ({
  config: MOCK_CONFIG,
  loading: false,
  fetchConfig: async () => {
    set({ loading: true });
    try {
      // Khi backend ready sẽ thay bằng:
      // const { data } = await api.get('/config/popup');
      // set({ config: data });
      await new Promise((r) => setTimeout(r, 100));
      set({ config: MOCK_CONFIG, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },
}));