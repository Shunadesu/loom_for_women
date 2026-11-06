import { create } from 'zustand';
import { fetchConfig as fetchConfigApi } from '../services/configApi.js';

// Giá trị mặc định — dùng làm fallback khi API lỗi hoặc field chưa có trong DB.
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
  // Logo thương hiệu — rỗng = dùng /logo.png mặc định
  logoUrl: '',
  logoAlt: 'Logo Loom for Women',
};

export const useConfigStore = create((set) => ({
  config: MOCK_CONFIG,
  loading: false,
  error: null,
  fetchConfig: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchConfigApi();
      // Merge để field mới (logoUrl, logoAlt…) có giá trị, field thiếu vẫn dùng default
      set({ config: { ...MOCK_CONFIG, ...(data || {}) }, loading: false });
    } catch (err) {
      set({
        config: MOCK_CONFIG,
        error: err?.response?.data?.error || 'Lỗi tải cấu hình.',
        loading: false,
      });
    }
  },
}));
