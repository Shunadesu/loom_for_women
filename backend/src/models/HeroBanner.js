import mongoose from 'mongoose';

/**
 * HeroBanner — ảnh trượt (swiper) trên trang chủ.
 * imageUrl: URL đầy đủ (http://...) — là URL local upload hoặc URL ngoài.
 */
const heroBannerSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200,
    },
    link: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
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

heroBannerSchema.index({ isActive: 1, order: 1, createdAt: -1 });

export default mongoose.model('HeroBanner', heroBannerSchema);