import mongoose from 'mongoose';

/**
 * ProductCategory — Danh mục sản phẩm (Phụ kiện, Thời trang, ...).
 * Tách riêng khỏi `Category` (đang dùng cho khóa học) để quản lý độc lập.
 */
const productCategorySchema = new mongoose.Schema(
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
    icon: {
      type: String,
      default: '🛍️',
      trim: true,
      maxlength: 8,
    },
    color: {
      type: String,
      default: '#E60067',
      trim: true,
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

productCategorySchema.index({ isActive: 1, order: 1 });

export default mongoose.model('ProductCategory', productCategorySchema);