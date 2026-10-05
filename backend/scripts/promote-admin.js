/**
 * Promote một user thành admin.
 *   node scripts/promote-admin.js <phone>
 *
 * Nếu user chưa tồn tại → tạo mới với role='admin'.
 * Nếu đã tồn tại → chỉ set role='admin' (giữ nguyên thông tin khác).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const phone = (process.argv[2] || '').trim();
if (!phone) {
  console.error('Cách dùng: node scripts/promote-admin.js <phone>');
  process.exit(1);
}

const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
if (!PHONE_REGEX.test(phone)) {
  console.error('Số điện thoại không hợp lệ.');
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Thiếu MONGO_URI trong .env');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const existing = await User.findOne({ phone });
    if (existing) {
      existing.role = 'admin';
      existing.isActive = true;
      await existing.save();
      console.log(`Đã cập nhật role=admin cho user: ${phone}`);
    } else {
      await User.create({ phone, role: 'admin' });
      console.log(`Đã tạo admin mới: ${phone}`);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Lỗi:', err.message);
    process.exit(1);
  }
})();