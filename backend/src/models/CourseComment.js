import mongoose from 'mongoose';

/**
 * CourseComment — Bình luận + rating cho 1 course.
 * - rating 1–5 (optional, chỉ comment cấp 1 mới rating)
 * - parentId hỗ trợ reply
 */
const courseCommentSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseComment',
      default: null,
      index: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

courseCommentSchema.index({ courseId: 1, isHidden: 1, createdAt: -1 });

export default mongoose.model('CourseComment', courseCommentSchema);