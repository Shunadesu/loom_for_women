import 'dotenv/config';
import mongoose from 'mongoose';
import Course from '../src/models/Course.js';
import Lesson from '../src/models/Lesson.js';

const dump = (s) => {
  if (s == null) return 'null';
  const buf = Buffer.from(String(s), 'utf8');
  return JSON.stringify(String(s)) + '  hex=' + buf.toString('hex');
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const courses = await Course.find({}, 'title slug').lean();
  console.log('=== COURSES ===');
  courses.forEach((c) => console.log(c._id, '|', dump(c.title), '|', c.slug));

  const lessons = await Lesson.find({}, 'title knowledgeTitle').lean();
  console.log('\n=== LESSONS ===');
  lessons.forEach((l) => {
    const bad = /�/.test(String(l.title)) || /[?]/.test(String(l.title));
    console.log(l._id, bad ? '*** BAD ***' : '          ', dump(l.title));
  });

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
