import LessonDocument, { LESSON_DOC_ALLOWED_TYPES } from '../models/LessonDocument.js';
import Lesson from '../models/Lesson.js';
import { safeUnlink } from '../middleware/upload.js';
import {
  publicUrlFor,
  filenameFromUrl,
  absFromFilename,
} from './documentController.js';

const recomputeLessonDocCount = async (lessonId) => {
  const count = await LessonDocument.countDocuments({ lessonId });
  await Lesson.findByIdAndUpdate(lessonId, { documentsCount: count }).catch(() => null);
};

const inferFileTypeFromExt = (ext, mimeType = '') => {
  const e = (ext || '').toLowerCase();
  if (['.pdf'].includes(e)) return 'pdf';
  if (['.xls', '.xlsx'].includes(e)) return 'excel';
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(e)) return 'infographic';
  // fallback by mime
  if (mimeType?.startsWith('image/')) return 'infographic';
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'excel';
  return 'guide';
};

const inferExtFromMime = (mimeType = '') => {
  if (mimeType === 'application/pdf') return '.pdf';
  if (
    mimeType === 'application/vnd.ms-excel'
  ) return '.xls';
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) return '.xlsx';
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  return '';
};

/**
 * POST /api/admin/lessons/:lessonId/documents
 * FormData: file (required), title, description?, fileType?, pageCount?, isPublished?
 */
export const createDocument = async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'Thiếu file tài liệu.' });
    }
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      safeUnlink(req.file.path);
      return res.status(404).json({ error: 'Bài học không tồn tại.' });
    }

    const { title, description = '', pageCount = 0, isPublished = true } = req.body;
    if (!title) {
      safeUnlink(req.file.path);
      return res.status(400).json({ error: 'Thiếu tiêu đề.' });
    }

    const requestedType = (req.body.fileType || '').toLowerCase();
    const finalType = LESSON_DOC_ALLOWED_TYPES.includes(requestedType)
      ? requestedType
      : inferFileTypeFromExt(req.file.mimetype && inferExtFromMime(req.file.mimetype), req.file.mimetype);

    const ext = req.file.mimetype && inferExtFromMime(req.file.mimetype);

    const fileUrl = publicUrlFor(req.file.filename);
    const doc = await LessonDocument.create({
      lessonId: lesson._id,
      courseId: lesson.courseId,
      title: String(title).slice(0, 200),
      description: String(description || '').slice(0, 500),
      fileUrl,
      fileType: finalType,
      fileExt: ext,
      fileSize: req.file.size || 0,
      pageCount: Math.max(0, Number(pageCount) || 0),
      isPublished: isPublished === 'false' || isPublished === false ? false : Boolean(isPublished),
    });
    await recomputeLessonDocCount(lesson._id);
    res.status(201).json({ document: doc });
  } catch (err) {
    if (req.file) safeUnlink(req.file.path);
    console.error('createDocument error', err);
    res.status(500).json({ error: 'Tạo tài liệu thất bại.' });
  }
};

/**
 * PUT /api/admin/documents/:id — cập nhật metadata (không đổi file).
 */
export const updateDocument = async (req, res) => {
  try {
    const doc = await LessonDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Không tìm thấy.' });

    const { title, description, fileType, pageCount, isPublished, order } = req.body;
    if (typeof title === 'string' && title.trim()) {
      doc.title = title.trim().slice(0, 200);
    }
    if (typeof description === 'string') {
      doc.description = description.slice(0, 500);
    }
    if (fileType && LESSON_DOC_ALLOWED_TYPES.includes(fileType)) {
      doc.fileType = fileType;
    }
    if (pageCount !== undefined && pageCount !== '') {
      doc.pageCount = Math.max(0, Number(pageCount) || 0);
    }
    if (isPublished !== undefined) {
      doc.isPublished =
        isPublished === 'false' || isPublished === false ? false : Boolean(isPublished);
    }
    if (order !== undefined && Number.isFinite(+order)) doc.order = +order;

    await doc.save();
    res.json({ document: doc });
  } catch (err) {
    console.error('updateDocument error', err);
    res.status(500).json({ error: 'Cập nhật thất bại.' });
  }
};

/**
 * DELETE /api/admin/documents/:id — xoá DB row + file vật lý.
 */
export const deleteDocument = async (req, res) => {
  try {
    const doc = await LessonDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Không tìm thấy.' });
    const lessonId = doc.lessonId;
    const fileName = filenameFromUrl(doc.fileUrl);
    await doc.deleteOne();
    if (fileName) safeUnlink(absFromFilename(fileName));
    await recomputeLessonDocCount(lessonId);
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteDocument error', err);
    res.status(500).json({ error: 'Xoá thất bại.' });
  }
};

/**
 * POST /api/admin/documents/reorder — body { items: [{ id, order }] }
 */
export const reorderDocuments = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'Thiếu danh sách items.' });
    }
    await Promise.all(
      items.map(({ id, order }) =>
        LessonDocument.findByIdAndUpdate(id, { order: +order || 0 }).catch(() => null)
      )
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Reorder thất bại.' });
  }
};

/**
 * GET /api/admin/lessons/:lessonId/documents — liệt kê tất cả document của lesson (cả ẩn).
 */
export const listDocumentsByLessonAdmin = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const items = await LessonDocument.find({ lessonId })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};