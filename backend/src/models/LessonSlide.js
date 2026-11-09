import mongoose from 'mongoose';

/**
 * LessonSlide — 1 slide trong phần "Cung cấp kiến thức" của bài học.
 *
 * Mỗi slide hiển thị 1 trang trình chiếu:
 *   - title      : tiêu đề slide
 *   - content    : mô tả/dẫn giải dạng text
 *   - bullets    : các gạch đầu dòng (mảng string)
 *   - imageUrl   : ảnh minh hoạ
 *   - note       : ghi chú an toàn (ô cảnh báo trong UI)
 *   - noteLabel  : nhãn của ô cảnh báo (VD: "ĐIỂM LƯU Ý AN TOÀN CỐT LÕI")
 */
const lessonSlideSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      default: '',
      maxlength: 4000,
    },
    bullets: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    note: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    noteLabel: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200,
    },
    durationSeconds: {
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

lessonSlideSchema.index({ lessonId: 1, order: 1 });

export default mongoose.model('LessonSlide', lessonSlideSchema);
