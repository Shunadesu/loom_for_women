import mongoose from 'mongoose';

/**
 * Visit — 1 lượt xem trang của frontend.
 *
 * Ghi nhận mọi lượt xem trang (kể cả khách ẩn danh) để admin theo dõi
 * lượt truy cập theo ngày / tháng / năm.
 *
 * KHÔNG đặt TTL index — cần giữ dữ liệu đủ lâu để tra cứu theo năm.
 */
export const VISIT_PAGE_TYPES = [
  'home',
  'course_list',
  'course_detail',
  'product',
  'other',
];

const visitSchema = new mongoose.Schema(
  {
    // Đường dẫn frontend, ví dụ '/', '/khoa-hoc', '/khoa-hoc/abc'
    path: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
      index: true,
    },
    pageType: {
      type: String,
      enum: VISIT_PAGE_TYPES,
      default: 'other',
      index: true,
    },
    // Khóa học được xem (chỉ set khi pageType = 'course_detail')
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    // visitorId lưu ở localStorage — dùng để đếm unique visitor
    sessionId: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
      index: true,
    },
    referrer: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    // 'desktop' | 'mobile' | 'tablet' | ''
    device: {
      type: String,
      default: '',
      trim: true,
      maxlength: 20,
      index: true,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// TTL index (tuỳ chọn): chỉ bật khi đặt VISIT_TTL_DAYS > 0 trong .env.
// Giữ dữ liệu đủ lâu để tra cứu theo năm, nhưng tránh collection phình vô hạn.
const VISIT_TTL_DAYS = Number(process.env.VISIT_TTL_DAYS) || 0;

visitSchema.index(
  { visitedAt: 1 },
  VISIT_TTL_DAYS > 0
    ? { expireAfterSeconds: VISIT_TTL_DAYS * 24 * 60 * 60 }
    : {}
);
visitSchema.index({ path: 1, visitedAt: -1 });
visitSchema.index({ courseId: 1, visitedAt: -1 });
visitSchema.index({ pageType: 1, visitedAt: -1 });

export default mongoose.model('Visit', visitSchema);
