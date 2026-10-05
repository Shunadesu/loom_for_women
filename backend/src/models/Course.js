import mongoose from 'mongoose';

/**
 * Course — Khóa học e-learning.
 * - thumbnail có thể là URL upload local hoặc URL ngoài (Unsplash, ...).
 * - rating là cache trung bình từ CourseComment (recomputed qua hook).
 */
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    lessonsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

courseSchema.index({ isActive: 1, isPublished: 1, order: 1, createdAt: -1 });
courseSchema.index({ category: 1, isActive: 1, isPublished: 1 });

export default mongoose.model('Course', courseSchema);