import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../src/config/db.js';
import Config, { CONFIG_ID } from '../src/models/Config.js';
import User from '../src/models/User.js';

const seed = async () => {
  await connectDB();

  // 1. Config singleton với defaults
  const config = await Config.findByIdAndUpdate(
    CONFIG_ID,
    {
      $setOnInsert: {
        _id: CONFIG_ID,
        welcomeTitle: 'Đem an toàn và hy vọng',
        welcomeDesc:
          'Cùng Loom for Women, mỗi bước chân của chị em đều được nâng niu và bảo vệ.',
        welcomeBtn: 'Bắt Đầu',
        registerTitle: 'Đăng Ký Tài Khoản',
        registerSubtitle: 'Tạo tài khoản mới cùng Loom',
        registerBtn: 'Đăng Ký Ngay',
        loginBtn: 'Đăng Nhập',
        laterBtn: 'Để Sau',
        themeColor: '#E60067',
        primaryShade: 600,
      },
    },
    { new: true, upsert: true }
  );
  console.log('[Seed] Config:', config);

  // 2. Admin mặc định — password: 'admin123' (ĐỔI NGAY khi lên prod!)
  const adminPhone = process.env.SEED_ADMIN_PHONE || '0900000000';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await User.create({
      phone: adminPhone,
      name: 'Admin',
      passwordHash,
      role: 'admin',
    });
    console.log(`[Seed] Tạo admin: phone=${adminPhone} password=${adminPassword}`);
    console.log(`[Seed] Admin ID: ${admin._id}`);
  } else {
    console.log(`[Seed] Admin đã tồn tại: phone=${existingAdmin.phone}`);
  }

  await disconnectDB();
  process.exit(0);
};

seed().catch((err) => {
  console.error('[Seed] Lỗi:', err);
  process.exit(1);
});