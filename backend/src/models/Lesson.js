import mongoose from 'mongoose';

/**
 * Lesson — Bài học trong 1 Course. Mỗi bài = 1 video YouTube.
 */
const lessonSchema = new mongoose.Schema(
  {
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
      maxlength: 200,
    },
    youtubeId: {
      type: String,
      required: true,
      trim: true,
      // 11 ký tự — validate ở controller
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    documentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, order: 1 });
lessonSchema.index({ courseId: 1, createdAt: 1 });

export default mongoose.model('Lesson', lessonSchema);