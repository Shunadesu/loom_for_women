import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

// Chuẩn hoá SĩT linh hoạt — mirror logic authController
function normalizePhone(input) {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/[\s\-().+]/g, '');
  if (!/^[0-9]{9,11}$/.test(digits)) return null;
  if (digits.startsWith('84') && digits.length === 11) {
    return '0' + digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return digits;
  }
  if (digits.length === 9 && /^[35789]/.test(digits)) {
    return '0' + digits;
  }
  return null;
}

// Đọc tham số từ CLI, fallback về giá trị mặc định
// Cú pháp: node scripts/create-admin.js [phone] [password] [name]
const [, , phoneArg = '0900000000', passwordArg = 'admin123', nameArg = 'Admin'] = process.argv;

const phone = normalizePhone(phoneArg);
if (!phone) {
  console.error(`❌ SĐT "${phoneArg}" không hợp lệ (phải 10 số, đầu 0 + 3/5/7/8/9, hoặc 11 số 84...).`);
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Đã kết nối MongoDB');

    const passwordHash = passwordArg ? await bcrypt.hash(passwordArg, 10) : '';

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        phone,
        role: 'admin',
        name: nameArg || 'Admin',
        isActive: true,
        passwordHash,
      });
      console.log('✓ Đã tạo admin mới');
    } else {
      user.role = 'admin';
      user.isActive = true;
      if (passwordArg) user.passwordHash = passwordHash;
      if (nameArg) user.name = nameArg;
      await user.save();
      console.log('✓ Đã cập nhật user thành admin');
    }

    console.log('---');
    console.log(JSON.stringify({
      id: user._id.toString(),
      phone: user.phone,
      role: user.role,
      name: user.name,
      isActive: user.isActive,
      hasPassword: !!user.passwordHash,
    }, null, 2));
    console.log('---');
    console.log(`📲 Login: ${phone}` + (passwordArg ? ` / ${passwordArg}` : ' (không mật khẩu)'));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
})();