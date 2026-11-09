import mongoose from 'mongoose';

/**
 * LessonSummary — phần "Tóm tắt bài học" của bài học.
 *
 * - format 'pdf_video' : PDF infographic + video tóm tắt
 * - format 'pdf'       : chỉ PDF infographic
 * - format 'video'     : chỉ video tóm tắt
 */
const SUMMARY_FORMATS = ['pdf_video', 'pdf', 'video'];

const lessonSummarySchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    format: {
      type: String,
      enum: SUMMARY_FORMATS,
      default: 'pdf_video',
    },
    // Ảnh/URL PDF infographic (poster tóm tắt)
    imageUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    // File PDF tải về (nếu admin upload file)
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
    // Video tóm tắt (YouTube)
    videoUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    youtubeId: {
      type: String,
      default: '',
      trim: true,
      maxlength: 20,
    },
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

lessonSummarySchema.index({ lessonId: 1, order: 1 });

export { SUMMARY_FORMATS };
export default mongoose.model('LessonSummary', lessonSummarySchema);
