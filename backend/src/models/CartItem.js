import mongoose from 'mongoose';

/**
 * CartItem — Một dòng trong giỏ hàng của user.
 * Unique { userId, productId } — 1 user chỉ có 1 dòng cho 1 sản phẩm, quantity tăng khi add thêm.
 */
const cartItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { timestamps: true }
);

// Mỗi user chỉ có 1 cart row cho mỗi product
cartItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model('CartItem', cartItemSchema);