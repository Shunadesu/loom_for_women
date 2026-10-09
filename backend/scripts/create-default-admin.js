/**
 * Tạo (hoặc cập nhật) tài khoản admin mặc định của hệ thống.
 *
 *   SĐT:      0900000000
 *   Mật khẩu: admin123
 *   Tên:      Admin
 *   Role:     admin
 *
 * Cách dùng (từ thư mục `backend/`):
 *   node scripts/create-default-admin.js
 *
 * Có thể override qua CLI:
 *   node scripts/create-default-admin.js [phone] [password] [name]
 *
 *   Ví dụ:
 *     node scripts/create-default-admin.js 0912345678 mypass "Quản trị"
 *
 * Lưu ý: hệ thống dùng SĐT làm tên đăng nhập — nếu đổi SĐT, hãy dùng SĐT
 * thật theo định dạng VN (10 số, đầu 0 + 3/5/7/8/9) hoặc 84xxxxxxxxx.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

// Mirror logic normalizePhone trong authController — đảm bảo SĐT chuẩn 0xxxxxxxxx
function normalizePhone(input) {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/[\s\-().+]/g, '');
  if (!/^[0-9]{9,11}$/.test(digits)) return null;
  if (digits.startsWith('84') && digits.length === 11) return '0' + digits.slice(2);
  if (digits.startsWith('0') && digits.length === 10) return digits;
  if (digits.length === 9 && /^[35789]/.test(digits)) return '0' + digits;
  return null;
}

const DEFAULT_PHONE = '0900000000';
const DEFAULT_PASSWORD = 'admin123';
const DEFAULT_NAME = 'Admin';

const [
  ,
  ,
  phoneArg = DEFAULT_PHONE,
  passwordArg = DEFAULT_PASSWORD,
  nameArg = DEFAULT_NAME,
] = process.argv;

const phone = normalizePhone(phoneArg);
if (!phone) {
  console.error(
    `❌ SĐT "${phoneArg}" không hợp lệ. Cần 10 số bắt đầu bằng 0 (3/5/7/8/9), hoặc 11 số 84xxxxxxxxx.`
  );
  process.exit(1);
}

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ Thiếu MONGODB_URI (hoặc MONGO_URI) trong file .env');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Đã kết nối MongoDB');

    const passwordHash = await bcrypt.hash(passwordArg, 10);

    let user = await User.findOne({ phone });
    let created = false;

    if (!user) {
      user = await User.create({
        phone,
        role: 'admin',
        name: nameArg,
        isActive: true,
        passwordHash,
      });
      created = true;
    } else {
      user.role = 'admin';
      user.isActive = true;
      user.name = nameArg || user.name;
      user.passwordHash = passwordHash;
      await user.save();
    }

    console.log('---');
    console.log(created ? '✓ Đã tạo admin mới' : '✓ Đã cập nhật admin');
    console.log(
      JSON.stringify(
        {
          id: user._id.toString(),
          phone: user.phone,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
        null,
        2
      )
    );
    console.log('---');
    console.log(`🔐 Đăng nhập admin panel (SĐT + mật khẩu):`);
    console.log(`   SĐT:      ${phone}`);
    console.log(`   Mật khẩu: ${passwordArg}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
})();
