import mongoose from 'mongoose';

/**
 * LessonSimulation — phần "Mô phỏng tình huống" của bài học.
 *
 * Mỗi mô phỏng gồm 1 video tình huống (YouTube) + mô tả bối cảnh,
 * kèm (tuỳ chọn) nhiều phát biểu Đúng/Sai để học viên tự kiểm tra.
 */
const statementSchema = new mongoose.Schema(
  {
    // Nội dung phát biểu học viên tự đánh giá Đúng / Sai
    text: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    isCorrect: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const lessonSimulationSchema = new mongoose.Schema(
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
    videoUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    youtubeId: {
      type: String,
      default: '',
      trim: true,
      maxlength: 20,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    // Danh sách phát biểu Đúng / Sai (mỗi mô phỏng có thể có nhiều câu)
    statements: {
      type: [statementSchema],
      default: [],
    },
    // Phát biểu để chọn Đúng / Sai (giữ lại để tương thích dữ liệu cũ)
    statement: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    isCorrect: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

lessonSimulationSchema.index({ lessonId: 1, order: 1 });

export default mongoose.model('LessonSimulation', lessonSimulationSchema);
