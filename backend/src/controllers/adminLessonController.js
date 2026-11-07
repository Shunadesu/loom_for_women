import path from 'path';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import { resolveVideoSource } from '../utils/videoSource.js';
import { safeUnlink, UPLOAD_LESSON_DIR } from '../middleware/upload.js';

const VALID_CONTENT_TYPES = ['video', 'video_pdf', 'image_pdf'];

const publicUrlFor = (filename) => `/uploads/lessons/${filename}`;

const filenameFromUrl = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url, 'http://localhost');
    return u.pathname.split('/').pop() || null;
  } catch {
    return null;
  }
};

const absFromFilename = (filename) =>
  filename ? path.join(UPLOAD_LESSON_DIR, filename) : null;

/** Xoá file PDF vật lý theo url đã lưu (nếu thuộc thư mục uploads/lessons). */
const removePdfFile = (pdfUrl) => {
  const name = filenameFromUrl(pdfUrl);
  if (name) safeUnlink(absFromFilename(name));
};

const recomputeCourseMeta = async (courseId) => {
  const count = await Lesson.countDocuments({ courseId });
  const lessons = await Lesson.find({ courseId }).lean();
  const totalSeconds = lessons.reduce(
    (acc, l) => acc + (Number(l.durationSeconds) || 0),
    0
  );
  await Course.findByIdAndUpdate(courseId, {
    lessonsCount: count,
    durationMinutes: Math.round(totalSeconds / 60),
  });
};

/**
 * Validate + chuẩn hoá dữ liệu bài học theo contentType.
 * @param {object} body - req.body
 * @param {object|null} file - req.file (PDF)
 * @param {object|null} current - bài học hiện tại (dùng cho update)
 * @returns {{ok: true, data: object} | {ok: false, error: string}}
 */
const buildLessonPayload = (body, file, current = null) => {
  const contentType = String(body.contentType || current?.contentType || 'video');
  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    return { ok: false, error: 'Loại nội dung bài học không hợp lệ.' };
  }

  const title = body.title !== undefined
    ? String(body.title).trim()
    : (current?.title || '');
  if (!title) return { ok: false, error: 'Thiếu tiêu đề bài học.' };

  const durationSeconds = Math.max(
    0,
    Number(body.durationSeconds !== undefined ? body.durationSeconds : current?.durationSeconds) || 0
  );

  const data = { contentType, title: title.slice(0, 200), durationSeconds };

  // ─── Video (dùng chung cho 'video' và 'video_pdf') ───
  const videoInput =
    body.videoUrl !== undefined
      ? body.videoUrl
      : body.youtubeUrl !== undefined
        ? body.youtubeUrl
        : body.youtubeId !== undefined
          ? body.youtubeId
          : current?.driveFileId
            ? current.driveFileId
            : current?.youtubeId || '';

  const source = resolveVideoSource(videoInput);

  if (contentType === 'video' || contentType === 'video_pdf') {
    if (!source.provider) {
      return {
        ok: false,
        error: 'Link video không hợp lệ. Hỗ trợ YouTube hoặc Google Drive.',
      };
    }
    data.videoProvider = source.provider;
    data.youtubeId = source.youtubeId;
    data.driveFileId = source.driveFileId;
  } else {
    // image_pdf — không có video
    data.videoProvider = '';
    data.youtubeId = '';
    data.driveFileId = '';
  }

  // ─── Ảnh URL (chỉ dùng cho 'image_pdf') ───
  if (contentType === 'image_pdf') {
    const imageUrl = body.imageUrl !== undefined
      ? String(body.imageUrl).trim()
      : (current?.imageUrl || '');
    if (!imageUrl) {
      return { ok: false, error: 'Thiếu URL ảnh cho bài học dạng Ảnh URL + PDF.' };
    }
    data.imageUrl = imageUrl.slice(0, 1000);
  } else {
    data.imageUrl = '';
  }

  // ─── File PDF ───
  if (file) {
    data.pdfUrl = publicUrlFor(file.filename);
    data.pdfName = String(file.originalname || file.filename).slice(0, 300);
  } else if (contentType === 'video_pdf' || contentType === 'image_pdf') {
    // Bắt buộc có PDF (giữ file cũ nếu đang sửa)
    const existing = current?.pdfUrl || '';
    if (!existing) {
      return { ok: false, error: 'Thiếu file PDF cho bài học.' };
    }
    data.pdfUrl = existing;
    data.pdfName = current?.pdfName || '';
  } else {
    data.pdfUrl = current?.pdfUrl || '';
    data.pdfName = current?.pdfName || '';
  }

  return { ok: true, data };
};

export const listLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const items = await Lesson.find({ courseId })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(404).json({ error: 'Khóa học không tồn tại.' });
    }

    const built = buildLessonPayload(req.body, req.file, null);
    if (!built.ok) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(400).json({ error: built.error });
    }

    const count = await Lesson.countDocuments({ courseId });
    const order = Number.isFinite(+req.body.order) ? +req.body.order : count;

    const lesson = await Lesson.create({
      courseId,
      ...built.data,
      order,
    });

    await recomputeCourseMeta(courseId);
    res.status(201).json({ lesson });
  } catch (err) {
    if (req.file) safeUnlink(req.file.path);
    console.error('createLesson error', err);
    res.status(500).json({ error: 'Tạo bài học thất bại.' });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(404).json({ error: 'Không tìm thấy.' });
    }

    const built = buildLessonPayload(req.body, req.file, lesson);
    if (!built.ok) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(400).json({ error: built.error });
    }

    const oldPdfUrl = lesson.pdfUrl;
    Object.assign(lesson, built.data);

    if (req.body.order !== undefined && Number.isFinite(+req.body.order)) {
      lesson.order = +req.body.order;
    }

    await lesson.save();

    // File PDF cũ bị thay thế → xoá file vật lý
    if (req.file && oldPdfUrl && oldPdfUrl !== lesson.pdfUrl) {
      removePdfFile(oldPdfUrl);
    }

    await recomputeCourseMeta(lesson.courseId);
    res.json({ lesson });
  } catch (err) {
    if (req.file) safeUnlink(req.file.path);
    console.error('updateLesson error', err);
    res.status(500).json({ error: 'Cập nhật thất bại.' });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Không tìm thấy.' });
    const courseId = lesson.courseId;
    removePdfFile(lesson.pdfUrl);
    await lesson.deleteOne();
    await recomputeCourseMeta(courseId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại.' });
  }
};

export const reorderLessons = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'Thiếu danh sách items.' });
    }
    await Promise.all(
      items.map(({ id, order }) =>
        Lesson.findByIdAndUpdate(id, { order: +order || 0 }).catch(() => null)
      )
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Reorder thất bại.' });
  }
};
