import mongoose from 'mongoose';

/**
 * Category — Danh mục khóa học (Móc len cơ bản, Phòng chống lừa đảo, ...).
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    color: {
      type: String,
      default: '#E60067',
      trim: true,
      // Cho phép hex (#RRGGBB) — validate nhẹ ở controller
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

categorySchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Category', categorySchema);