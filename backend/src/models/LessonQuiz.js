import mongoose from 'mongoose';

/**
 * LessonQuiz — phần "Đánh giá nội dung học" của bài học.
 *
 * - type 'single'    : 1 câu trắc nghiệm A/B/C/D, đúng 1 đáp án
 * - type 'true_false': 1 câu Đúng / Sai (options chỉ dùng A/B)
 */
const QUIZ_TYPES = ['single', 'true_false'];

const lessonQuizSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    options: {
      A: { type: String, default: '', maxlength: 500 },
      B: { type: String, default: '', maxlength: 500 },
      C: { type: String, default: '', maxlength: 500 },
      D: { type: String, default: '', maxlength: 500 },
    },
    // Đáp án đúng: 'A' | 'B' | 'C' | 'D' (mặc định B theo thiết kế admin)
    correct: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      default: 'B',
    },
    // Video tình huống phục vụ cho câu hỏi (YouTube embed)
    videoUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    videoDescription: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: QUIZ_TYPES,
      default: 'single',
    },
    explain: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

lessonQuizSchema.index({ lessonId: 1, order: 1 });

export { QUIZ_TYPES };
export default mongoose.model('LessonQuiz', lessonQuizSchema);
