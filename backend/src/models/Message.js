import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    // Conversation participants
    sellerId: {
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
    buyerAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    },
    // Message content
    lastMessage: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Product context (optional)
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    productTitle: {
      type: String,
      default: '',
    },
    // Unread status
    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Conversation status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for seller queries
messageSchema.index({ sellerId: 1, lastMessageAt: -1 });
messageSchema.index({ sellerPhone: 1, lastMessageAt: -1 });

// Compound index for conversation uniqueness
messageSchema.index({ sellerId: 1, buyerPhone: 1 }, { unique: true });

export default mongoose.model('Message', messageSchema);
