import mongoose from 'mongoose';

/**
 * ForumPost — Bài viết trong Diễn đàn cộng đồng.
 * - User đăng bài, trạng thái mặc định là 'pending'
 * - Admin duyệt bài → 'approved' (hiển thị công khai) hoặc 'rejected'
 * - Admin có thể đánh dấu 'isQualityPost' và nhập mã voucher thưởng
 */
const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    category: {
      type: String,
      required: true,
      enum: ['income-tips', 'scam-warning', 'learning-tips'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    isQualityPost: {
      type: Boolean,
      default: false,
    },
    voucherCode: {
      type: String,
      default: null,
      trim: true,
      maxlength: 50,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Index để query hiệu quả
forumPostSchema.index({ status: 1, createdAt: -1 });
forumPostSchema.index({ category: 1, status: 1, createdAt: -1 });

export default mongoose.model('ForumPost', forumPostSchema);
