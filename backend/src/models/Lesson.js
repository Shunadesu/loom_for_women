import mongoose from 'mongoose';

/**
 * Lesson — Bài học trong 1 Course.
 *
 * Mỗi bài học thuộc 1 trong 3 loại nội dung (contentType):
 *   - 'video'      : chỉ có video (YouTube hoặc Google Drive)
 *   - 'video_pdf'  : video (YouTube/Drive) + 1 file PDF đính kèm
 *   - 'image_pdf'  : 1 ảnh (URL) + 1 file PDF đính kèm
 *
 * Bài học cũ (không có contentType) mặc định 'video' — vẫn hiển thị bình thường.
 */
const LESSON_CONTENT_TYPES = ['video', 'video_pdf', 'image_pdf'];

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    // Loại nội dung của bài học — quyết định cách render ở frontend.
    contentType: {
      type: String,
      enum: LESSON_CONTENT_TYPES,
      default: 'video',
    },
    // Nguồn video: 'youtube' | 'drive' | '' (bài học chỉ có ảnh + PDF)
    videoProvider: {
      type: String,
      enum: ['youtube', 'drive', ''],
      default: '',
    },
    youtubeId: {
      type: String,
      default: '',
      trim: true,
      // 11 ký tự — validate ở controller
    },
    // Google Drive file id (video embed từ Drive)
    driveFileId: {
      type: String,
      default: '',
      trim: true,
    },
    // Ảnh bài học (dán URL) — dùng cho contentType 'image_pdf'
    imageUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    // File PDF đính kèm trực tiếp trên bài học (public URL trong /uploads/lessons)
    pdfUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    pdfName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    // ─── Phần 1: Cung cấp kiến thức (Slide & Nội dung) ───────────────
    // Tên bài học kiến thức (hiển thị ở phần 1 của modal học).
    knowledgeTitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    // Nội dung dạng slide & text chi tiết.
    knowledgeContent: {
      type: String,
      default: '',
      maxlength: 8000,
    },
    // File PDF slide đính kèm (nếu admin upload).
    slidePdfUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    slidePdfName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    slidePdfTitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    // Ảnh bìa khóa học dạng URL ngoài (dùng cho form nhập nhanh).
    coverUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    documentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, order: 1 });
lessonSchema.index({ courseId: 1, createdAt: 1 });

export { LESSON_CONTENT_TYPES };
export default mongoose.model('Lesson', lessonSchema);
