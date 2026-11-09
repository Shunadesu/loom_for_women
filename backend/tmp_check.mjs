import mongoose from 'mongoose';
import 'dotenv/config';
import Course from './src/models/Course.js';
import Lesson from './src/models/Lesson.js';

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const courses = await Course.find({}).sort({ createdAt: -1 }).lean();
  for (const c of courses) {
    const n = await Lesson.countDocuments({ courseId: c._id });
    console.log(
      `${c.createdAt.toISOString()} | lessonsCount=${c.lessonsCount} actual=${n} | ${c.title} | ${c._id}`
    );
  }
  // Bài học mồ côi (courseId không tồn tại)
  const ids = courses.map((c) => c._id);
  const orphans = await Lesson.find({ courseId: { $nin: ids } }).lean();
  console.log('\nORPHAN LESSONS:', orphans.length);
  orphans.forEach((l) => console.log('  -', l.title, l.courseId, l.createdAt.toISOString()));
  await mongoose.disconnect();
})();
