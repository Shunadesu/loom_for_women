import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/User.js';

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({ role: 'admin' }).select('phone role fullName').lean();
  console.log(users);
  await mongoose.disconnect();
})();
