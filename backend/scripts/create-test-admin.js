import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const phone = '0900000000';

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, role: 'admin', name: 'Admin Test', isActive: true });
      console.log('Đã tạo admin:', phone);
    } else {
      user.role = 'admin';
      user.isActive = true;
      user.name = user.name || 'Admin Test';
      await user.save();
      console.log('Đã promote admin:', phone);
    }
    console.log(JSON.stringify({ id: user._id, phone: user.phone, role: user.role, name: user.name }, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Lỗi:', err.message);
    process.exit(1);
  }
})();