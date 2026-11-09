import mongoose from 'mongoose';
import 'dotenv/config';
import Course from './src/models/Course.js';

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const c = await Course.findById('6af191cb34895cf81f350b39').lean();
  console.log(JSON.stringify(c, null, 2));
  await mongoose.disconnect();
})();
