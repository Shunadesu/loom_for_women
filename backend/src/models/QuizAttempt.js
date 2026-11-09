import mongoose from 'mongoose';

/**
 * QuizAttempt — lịch sử trả lời trắc nghiệm của học viên.
 *
 * Dùng để chống double-count điểm và hiển thị kết quả đã làm.
 */
const quizAttemptSchema = new mongoose.Schema(
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
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LessonQuiz',
      required: true,
      index: true,
    },
    answer: {
      type: String,
      default: '',
      maxlength: 10,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, quizId: 1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);
