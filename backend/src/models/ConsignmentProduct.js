import mongoose from 'mongoose';

/**
 * ConsignmentProduct — Sản phẩm ký gửi do user đăng.
 * Flow: user tạo → status pending → admin approve/reject
 * Khi approve → tạo Product record tương ứng trong Marketplace
 */
const consignmentProductSchema = new mongoose.Schema(
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
      default: 1,
      min: 0,
    },
    sellerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    sellerPhone: {
      type: String,
      required: true,
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
    // User đăng ký gửi
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Status workflow
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      maxlength: 500,
    },
    // Admin duyệt
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    // Product ID tương ứng sau khi approve
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes
consignmentProductSchema.index({ userId: 1, status: 1, createdAt: -1 });
consignmentProductSchema.index({ status: 1, createdAt: -1 });

/** Virtual: discountPct */
consignmentProductSchema.virtual('discountPct').get(function getDiscountPct() {
  if (
    this.originalPrice > 0 &&
    this.price > 0 &&
    this.originalPrice > this.price
  ) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

consignmentProductSchema.set('toJSON', { virtuals: true });
consignmentProductSchema.set('toObject', { virtuals: true });

export default mongoose.model('ConsignmentProduct', consignmentProductSchema);
