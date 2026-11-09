/**
 * Tạo tài khoản admin mới — hoặc gán lại mật khẩu cho tài khoản admin đã có.
 *
 * Mục đích: dùng khi form login admin báo
 *   "Tài khoản chưa được đặt mật khẩu. Vui lòng liên hệ quản trị viên."
 * (user có passwordHash rỗng, hoặc bạn vừa đổi SĐT admin).
 *
 * Cách dùng (từ thư mục backend):
 *   node scripts/create-admin-user.js <sdt> <mat-khau> [ten]
 *
 * Ví dụ:
 *   node scripts/create-admin-user.js 0912345678 admin123 Admin
 *
 * Hoặc dùng npm script (mặc định đã trỏ sẵn SĐT + mật khẩu):
 *   npm run create:admin
 *   npm run create:admin -- 0912345678 admin123 Admin
 *
 * Ghi chú:
 * - SĐT được chuẩn hoá về dạng 0xxxxxxxxx (10 số) giống hệt logic trong
 *   authController, nên nhập 0912345678 / 84912345678 / 912345678 đều cho
 *   cùng một tài khoản.
 * - Script tương tác trực tiếp với MongoDB, KHÔNG cần backend đang chạy.
 * - Nếu tài khoản đã tồn tại: script sẽ nâng role thành admin, bật isActive
 *   và đặt lại mật khẩu (không tạo trùng).
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

// Mirror logic normalizePhone trong authController
function normalizePhone(input) {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/[\s\-().+]/g, '');
  if (!/^[0-9]{9,11}$/.test(digits)) return null;
  if (digits.startsWith('84') && digits.length === 11) return '0' + digits.slice(2);
  if (digits.startsWith('0') && digits.length === 10) return digits;
  if (digits.length === 9 && /^[35789]/.test(digits)) return '0' + digits;
  return null;
}

const DEFAULT_PHONE = '0912345678';
const DEFAULT_PASSWORD = 'admin123';
const DEFAULT_NAME = 'Admin';
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

const [, , phoneArg = DEFAULT_PHONE, passwordArg = DEFAULT_PASSWORD, nameArg = DEFAULT_NAME] =
  process.argv;

const phone = normalizePhone(phoneArg);
if (!phone) {
  console.error(`❌ SĐT "${phoneArg}" không hợp lệ. Cần 10 số bắt đầu bằng 0, hoặc 11 số 84xxxxxxxxx.`);
  process.exit(1);
}

if (typeof passwordArg !== 'string' || passwordArg.length < MIN_PASSWORD_LENGTH) {
  console.error(`❌ Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`);
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

    const passwordHash = await bcrypt.hash(passwordArg, BCRYPT_ROUNDS);

    const existing = await User.findOne({ phone });
    let action;

    if (!existing) {
      const user = await User.create({
        phone,
        role: 'admin',
        name: nameArg,
        isActive: true,
        passwordHash,
      });
      action = 'created';
      console.log('✓ Đã tạo tài khoản admin mới');
      printSummary(user);
    } else {
      const before = {
        role: existing.role,
        isActive: existing.isActive,
        hadPassword: !!existing.passwordHash,
      };

      existing.role = 'admin';
      existing.isActive = true;
      existing.passwordHash = passwordHash;
      if (nameArg) existing.name = nameArg;
      await existing.save();

      action = 'updated';
      console.log('✓ Đã cập nhật tài khoản admin');
      printSummary(existing);

      if (before.role !== 'admin') console.log(`  ↳ role: ${before.role} → admin`);
      if (!before.isActive) console.log('  ↳ isActive: false → true');
      if (!before.hadPassword) console.log('  ↳ đã đặt mật khẩu (trước đó tài khoản chưa có mật khẩu)');
    }

    console.log('---');
    console.log('🔐 Đăng nhập admin panel:');
    console.log(`   SĐT:      ${phone}`);
    console.log(`   Mật khẩu: ${passwordArg}`);
    console.log('---');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
})();

function printSummary(user) {
  console.log(
    JSON.stringify(
      {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        hasPassword: !!user.passwordHash,
      },
      null,
      2
    )
  );
}
