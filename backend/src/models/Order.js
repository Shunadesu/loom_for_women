import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      unique: true,
      index: true,
    },
    // Seller info (người bán - chủ sản phẩm)
    sellerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerPhone: {
      type: String,
      required: true,
      index: true,
    },
    // Buyer info (người mua)
    buyerName: {
      type: String,
      required: true,
      trim: true,
    },
    buyerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    buyerAddress: {
      type: String,
      default: '',
      trim: true,
    },
    // Product info
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    // Order status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'done'],
      default: 'pending',
      index: true,
    },
    // Notes
    buyerNote: {
      type: String,
      default: '',
      maxlength: 500,
    },
    sellerNote: {
      type: String,
      default: '',
      maxlength: 500,
    },
    // Timestamps for status changes
    confirmedAt: {
      type: Date,
      default: null,
    },
    shippedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-generate order code
orderSchema.pre('save', async function (next) {
  if (!this.orderCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Order').countDocuments();
    this.orderCode = `#ORD-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index for seller queries
orderSchema.index({ sellerUserId: 1, createdAt: -1 });
orderSchema.index({ sellerPhone: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
