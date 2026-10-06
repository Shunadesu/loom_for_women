import mongoose from 'mongoose';

/**
 * Product — Sản phẩm Cửa hàng Sinh kế (do admin đăng).
 * - thumbnail có thể là URL upload local hoặc URL ngoài (Unsplash, ...).
 * - discountPct được tính tự động từ originalPrice/price.
 */
const productSchema = new mongoose.Schema(
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
    images: {
      type: [String],
      default: [],
      // Danh sách URL ảnh chi tiết (optional, mở rộng sau)
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory',
      default: null,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    sellerName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    sellerPhone: {
      type: String,
      default: '',
      trim: true,
      maxlength: 15,
      index: true,
    },
    sellerZaloUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
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

// Compound indexes cho query phổ biến
productSchema.index({ isActive: 1, isPublished: 1, order: 1, createdAt: -1 });
productSchema.index({ category: 1, isActive: 1, isPublished: 1 });

/** Virtual: discountPct = phần trăm giảm giá (0-100). */
productSchema.virtual('discountPct').get(function getDiscountPct() {
  if (
    this.originalPrice > 0 &&
    this.price > 0 &&
    this.originalPrice > this.price
  ) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);