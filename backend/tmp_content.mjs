import mongoose from 'mongoose';
import 'dotenv/config';
import Lesson from './src/models/Lesson.js';
import LessonSlide from './src/models/LessonSlide.js';
import LessonQuiz from './src/models/LessonQuiz.js';
import LessonSimulation from './src/models/LessonSimulation.js';
import LessonSummary from './src/models/LessonSummary.js';

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const lessons = await Lesson.find({}).select('title courseId').lean();
  for (const l of lessons) {
    const [s, q, sim, sum] = await Promise.all([
      LessonSlide.countDocuments({ lessonId: l._id }),
      LessonQuiz.countDocuments({ lessonId: l._id }),
      LessonSimulation.countDocuments({ lessonId: l._id }),
      LessonSummary.countDocuments({ lessonId: l._id }),
    ]);
    if (s + q + sim + sum > 0) {
      console.log(`${l.title}: slides=${s} quizzes=${q} sim=${sim} summary=${sum}`);
    }
  }
  console.log('--- totals ---');
  console.log('slides', await LessonSlide.countDocuments({}));
  console.log('quizzes', await LessonQuiz.countDocuments({}));
  console.log('simulations', await LessonSimulation.countDocuments({}));
  console.log('summaries', await LessonSummary.countDocuments({}));
  await mongoose.disconnect();
})();
