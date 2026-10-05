import mongoose from 'mongoose';

/**
 * UserProgress — Tiến độ học của user trong 1 course.
 * Unique (userId, courseId) — 1 dòng duy nhất cho mỗi cặp.
 */
const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    lastLessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    progressPct: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastWatchedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
userProgressSchema.index({ courseId: 1, userId: 1 });

export default mongoose.model('UserProgress', userProgressSchema);