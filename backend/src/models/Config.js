import mongoose from 'mongoose';

/**
 * Config là singleton — chỉ 1 bản ghi duy nhất (_id = 'singleton').
 * Frontend gọi GET /api/config để lấy text/title/color cho popup.
 * Admin PUT để cập nhật.
 */
const configSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: 'singleton',
    },
    // Welcome popup
    welcomeTitle: { type: String, default: 'Đem an toàn và hy vọng' },
    welcomeDesc: {
      type: String,
      default:
        'Cùng Loom for Women, mỗi bước chân của chị em đều được nâng niu và bảo vệ.',
    },
    welcomeBtn: { type: String, default: 'Bắt Đầu' },

    // Register popup
    registerTitle: { type: String, default: 'Đăng Ký Tài Khoản' },
    registerSubtitle: { type: String, default: 'Tạo tài khoản mới cùng Loom' },
    registerBtn: { type: String, default: 'Đăng Ký Ngay' },

    // Login
    loginBtn: { type: String, default: 'Đăng Nhập' },

    // Common
    laterBtn: { type: String, default: 'Để Sau' },

    // Theme
    themeColor: { type: String, default: '#E60067' },
    primaryShade: { type: Number, default: 600, min: 100, max: 900 },
  },
  { timestamps: true }
);

export const CONFIG_ID = 'singleton';
export default mongoose.model('Config', configSchema);