import mongoose from 'mongoose';

/**
 * LessonDocument — Tài liệu đính kèm 1 Lesson.
 *
 * Hỗ trợ nhiều định dạng: PDF, Excel, Infographic (ảnh), Hướng dẫn (PDF/ảnh).
 * File vật lý nằm trong uploads/documents/, còn fileUrl lưu URL public.
 */
const ALLOWED_TYPES = ['pdf', 'excel', 'infographic', 'guide'];

const lessonDocumentSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    fileType: {
      type: String,
      enum: ALLOWED_TYPES,
      required: true,
    },
    fileExt: {
      type: String,
      default: '',
      maxlength: 10,
    },
    fileSize: {
      type: Number,
      default: 0,
      min: 0,
    },
    pageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

lessonDocumentSchema.index({ lessonId: 1, order: 1 });
lessonDocumentSchema.index({ courseId: 1, isPublished: 1 });
lessonDocumentSchema.index({ title: 'text', description: 'text' });

export const LESSON_DOC_ALLOWED_TYPES = ALLOWED_TYPES;
export default mongoose.model('LessonDocument', lessonDocumentSchema);