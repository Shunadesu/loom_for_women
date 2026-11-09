import 'dotenv/config';
import mongoose from 'mongoose';
import Course from '../src/models/Course.js';
import Lesson from '../src/models/Lesson.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

(async () => {
  await mongoose.connect(MONGO_URI);

  const lessons = await Lesson.find({}).lean();
  console.log(`Tổng số lesson: ${lessons.length}\n`);
  for (const l of lessons) {
    const course = await Course.findById(l.courseId).lean();
    const titleBytes = Buffer.from(l.title, 'utf8');
    console.log('---');
    console.log('id      :', l._id.toString());
    console.log('course  :', course ? `${course.title} (${course.slug})` : 'KHÔNG CÒN');
    console.log('title   :', JSON.stringify(l.title));
    console.log('hex     :', titleBytes.toString('hex'));
    console.log('codepoints:', [...l.title].map((c) => c.codePointAt(0).toString(16)).join(' '));
  }

  const courses = await Course.find({}).lean();
  console.log(`\nTổng số course: ${courses.length}`);
  for (const c of courses) {
    console.log('---');
    console.log('id    :', c._id.toString());
    console.log('slug  :', c.slug);
    console.log('title :', JSON.stringify(c.title));
    console.log('isActive:', c.isActive);
  }

  await mongoose.disconnect();
  process.exit(0);
})();
