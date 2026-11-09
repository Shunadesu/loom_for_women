import path from 'path';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import LessonSlide from '../models/LessonSlide.js';
import LessonQuiz from '../models/LessonQuiz.js';
import LessonSimulation from '../models/LessonSimulation.js';
import LessonSummary from '../models/LessonSummary.js';
import { resolveVideoSource } from '../utils/videoSource.js';
import { safeUnlink, UPLOAD_LESSON_DIR } from '../middleware/upload.js';
import {
  parseJsonField,
  replaceSlides,
  replaceQuizzes,
  replaceSimulations,
  replaceSummary,
  purgeLessonContent,
} from '../services/lessonContentService.js';

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

/** Xoá file vật lý theo url đã lưu (nếu thuộc thư mục uploads/lessons). */
const removeFileByUrl = (url) => {
  const name = filenameFromUrl(url);
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
 * Lấy file PDF đính kèm từ request.
 * multer `.single('pdf')` đặt vào req.file; `.fields([...])` đặt vào req.files.pdf[0].
 */
const pickPdfFile = (req) => req.file || req.files?.pdf?.[0] || null;

/**
 * Kiểm tra lesson đã có nội dung 4 phần trong DB hay chưa.
 * Dùng để biết bài học "4 phần" vẫn hợp lệ khi request không gửi kèm
 * các field nội dung (ví dụ admin chỉ sửa media).
 */
const hasStoredContentFor = async (lessonId) => {
  const [slide, quiz, simulation, summary] = await Promise.all([
    LessonSlide.countDocuments({ lessonId }),
    LessonQuiz.countDocuments({ lessonId }),
    LessonSimulation.countDocuments({ lessonId }),
    LessonSummary.countDocuments({ lessonId }),
  ]);
  return slide + quiz + simulation + summary > 0;
};

/**
 * Đọc 4 phần nội dung từ body (FormData) — dùng chung create & update.
 * @param {object} body
 * @param {object} files - req.files (multer) dạng { slidePdf: [], summaryImage: [], summaryPdf: [] }
 */
const readContentPayload = (body, files = {}) => {
  const slides = parseJsonField(body.slides, []);
  const quizzes = parseJsonField(body.quizzes, []);
  const simulations = parseJsonField(body.simulations, []);
  const summary = parseJsonField(body.summary, null) || {};

  const slidePdfFile = files.slidePdf?.[0] || null;
  const summaryImageFile = files.summaryImage?.[0] || null;
  const summaryPdfFile = files.summaryPdf?.[0] || null;

  return {
    slides: Array.isArray(slides) ? slides : [],
    quizzes: Array.isArray(quizzes) ? quizzes : [],
    simulations: Array.isArray(simulations) ? simulations : [],
    summary: {
      format: summary.format,
      imageUrl: summaryImageFile
        ? publicUrlFor(summaryImageFile.filename)
        : String(summary.imageUrl || '').trim().slice(0, 1000),
      videoUrl: String(summary.videoUrl || '').trim().slice(0, 1000),
      title: String(summary.title || '').trim().slice(0, 300),
      pdfUrl: summaryPdfFile
        ? publicUrlFor(summaryPdfFile.filename)
        : String(summary.pdfUrl || '').trim().slice(0, 1000),
      pdfName: summaryPdfFile
        ? String(summaryPdfFile.originalname || '').slice(0, 300)
        : String(summary.pdfName || '').trim().slice(0, 300),
    },
    slidePdfFile,
    summaryImageFile,
    summaryPdfFile,
    /**
     * Field nào thực sự được gửi lên. Chỉ ghi đè phần nội dung tương ứng —
     * tránh việc update media làm mất 4 phần đã có.
     */
    provided: {
      slides: body.slides !== undefined,
      quizzes: body.quizzes !== undefined,
      simulations: body.simulations !== undefined,
      summary: body.summary !== undefined,
    },
  };
};

/**
 * Bài học có nội dung 4 phần hay không (dùng để nới validation video).
 * @param {object} content - payload 4 phần đã đọc
 * @param {boolean} [hasStoredContent] - lesson đã có sẵn 4 phần trong DB
 */
const hasStructuredContent = (content, hasStoredContent = false) =>
  Boolean(
    hasStoredContent ||
      (content.slides || []).length ||
      (content.quizzes || []).length ||
      (content.simulations || []).length ||
      content.summary?.imageUrl ||
      content.summary?.videoUrl ||
      content.summary?.pdfUrl
  );

/**
 * Validate + chuẩn hoá dữ liệu bài học theo contentType.
 * @param {object} body - req.body
 * @param {object|null} file - req.file (PDF media bổ sung)
 * @param {object} files - req.files (slidePdf / summaryImage / summaryPdf)
 * @param {object|null} current - bài học hiện tại (dùng cho update)
 * @param {object} content - payload 4 phần đã đọc (readContentPayload)
 * @param {boolean} [hasStoredContent] - lesson đã có sẵn 4 phần trong DB
 * @returns {{ok: true, data: object} | {ok: false, error: string}}
 */
const buildLessonPayload = (
  body,
  file,
  files,
  current = null,
  content = null,
  hasStoredContent = false
) => {
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
  const structured = content ? hasStructuredContent(content, hasStoredContent) : false;

  if (contentType === 'video' || contentType === 'video_pdf') {
    // Bài học chỉ có nội dung 4 phần thì không bắt buộc có video.
    if (!source.provider && !structured) {
      return {
        ok: false,
        error:
          'Link video không hợp lệ. Hỗ trợ YouTube hoặc Google Drive. ' +
          'Hoặc nhập ít nhất một phần nội dung 4 phần (slide / mô phỏng / tóm tắt / trắc nghiệm).',
      };
    }
    data.videoProvider = source.provider || '';
    data.youtubeId = source.youtubeId || '';
    data.driveFileId = source.driveFileId || '';
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

  // ─── File PDF đính kèm ───
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

  // ─── Phần 1: kiến thức (tiêu đề + nội dung + PDF slide) ───
  if (body.knowledgeTitle !== undefined) {
    data.knowledgeTitle = String(body.knowledgeTitle || '').trim().slice(0, 300);
  }
  if (body.knowledgeContent !== undefined) {
    data.knowledgeContent = String(body.knowledgeContent || '').trim().slice(0, 8000);
  }
  if (body.slidePdfTitle !== undefined) {
    data.slidePdfTitle = String(body.slidePdfTitle || '').trim().slice(0, 300);
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
    console.error('listLessonsByCourse error', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      const bad = pickPdfFile(req);
      if (bad) safeUnlink(bad.path);
      res.status(404).json({ error: 'Khóa học không tồn tại.' });
      return;
    }

    const content = readContentPayload(req.body, req.files || {});
    const built = buildLessonPayload(
      req.body,
      pickPdfFile(req),
      req.files,
      null,
      content
    );
    if (!built.ok) {
      const bad = pickPdfFile(req);
      if (bad) safeUnlink(bad.path);
      res.status(400).json({ error: built.error });
      return;
    }

    const count = await Lesson.countDocuments({ courseId });
    const order = Number.isFinite(+req.body.order) ? +req.body.order : count;

    const lesson = await Lesson.create({
      courseId,
      ...built.data,
      order,
      slidePdfUrl: content.slidePdfFile
        ? publicUrlFor(content.slidePdfFile.filename)
        : '',
      slidePdfName: content.slidePdfFile
        ? String(content.slidePdfFile.originalname || '').slice(0, 300)
        : '',
    });

    // Lưu 4 phần nội dung — bọc try/catch riêng để báo rõ lỗi phần nào hỏng
    try {
      if (content.provided.slides) {
        await replaceSlides(lesson._id, course._id, content.slides);
      }
      if (content.provided.quizzes) {
        await replaceQuizzes(lesson._id, course._id, content.quizzes);
      }
      if (content.provided.simulations) {
        await replaceSimulations(lesson._id, course._id, content.simulations);
      }
      if (content.provided.summary) {
        await replaceSummary(lesson._id, course._id, content.summary);
      }
    } catch (contentErr) {
      console.error('createLesson content error', contentErr);
      const bad = pickPdfFile(req);
      if (bad) safeUnlink(bad.path);
      res.status(500).json({
        error: 'Đã tạo bài học nhưng lỗi khi lưu nội dung 4 phần. Vui lòng thử lại.',
      });
      return;
    }

    await recomputeCourseMeta(courseId);
    res.status(201).json({ lesson });
  } catch (err) {
    const bad = pickPdfFile(req);
    if (bad) safeUnlink(bad.path);
    console.error('createLesson error', err);
    res.status(500).json({ error: 'Tạo bài học thất bại.' });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      const bad = pickPdfFile(req);
      if (bad) safeUnlink(bad.path);
      res.status(404).json({ error: 'Không tìm thấy.' });
      return;
    }

    const content = readContentPayload(req.body, req.files || {});
    const stored = await hasStoredContentFor(lesson._id);
    const built = buildLessonPayload(
      req.body,
      pickPdfFile(req),
      req.files,
      lesson,
      content,
      stored
    );
    if (!built.ok) {
      const bad = pickPdfFile(req);
      if (bad) safeUnlink(bad.path);
      res.status(400).json({ error: built.error });
      return;
    }

    const oldPdfUrl = lesson.pdfUrl;
    const oldSlidePdfUrl = lesson.slidePdfUrl;
    Object.assign(lesson, built.data);

    if (req.body.order !== undefined && Number.isFinite(+req.body.order)) {
      lesson.order = +req.body.order;
    }

    // PDF slide mới → thay thế file cũ
    if (content.slidePdfFile) {
      lesson.slidePdfUrl = publicUrlFor(content.slidePdfFile.filename);
      lesson.slidePdfName = String(content.slidePdfFile.originalname || '').slice(0, 300);
    }

    await lesson.save();

    // File cũ bị thay thế → xoá file vật lý
    if (pickPdfFile(req) && oldPdfUrl && oldPdfUrl !== lesson.pdfUrl) {
      removeFileByUrl(oldPdfUrl);
    }
    if (content.slidePdfFile && oldSlidePdfUrl && oldSlidePdfUrl !== lesson.slidePdfUrl) {
      removeFileByUrl(oldSlidePdfUrl);
    }

    // Lưu 4 phần nội dung — bọc try/catch riêng để báo rõ lỗi phần nào hỏng
    try {
      if (content.provided.slides) {
        await replaceSlides(lesson._id, lesson.courseId, content.slides);
      }
      if (content.provided.quizzes) {
        await replaceQuizzes(lesson._id, lesson.courseId, content.quizzes);
      }
      if (content.provided.simulations) {
        await replaceSimulations(lesson._id, lesson.courseId, content.simulations);
      }
      if (content.provided.summary) {
        await replaceSummary(lesson._id, lesson.courseId, content.summary);
      }
    } catch (contentErr) {
      console.error('updateLesson content error', contentErr);
      res.status(500).json({
        error: 'Đã lưu thông tin bài học nhưng lỗi khi lưu nội dung 4 phần. Vui lòng thử lại.',
      });
      return;
    }

    await recomputeCourseMeta(lesson.courseId);
    res.json({ lesson });
  } catch (err) {
    const bad = pickPdfFile(req);
    if (bad) safeUnlink(bad.path);
    console.error('updateLesson error', err);
    res.status(500).json({ error: 'Cập nhất bại.' });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      res.status(404).json({ error: 'Không tìm thấy.' });
      return;
    }
    const courseId = lesson.courseId;
    removeFileByUrl(lesson.pdfUrl);
    removeFileByUrl(lesson.slidePdfUrl);
    await purgeLessonContent(lesson._id);
    await lesson.deleteOne();
    await recomputeCourseMeta(courseId);
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteLesson error', err);
    res.status(500).json({ error: 'Xoá thất bại.' });
  }
};

export const reorderLessons = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      res.status(400).json({ error: 'Thiếu danh sách items.' });
      return;
    }
    await Promise.all(
      items.map(({ id, order }) =>
        Lesson.findByIdAndUpdate(id, { order: +order || 0 }).catch(() => null)
      )
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('reorderLessons error', err);
    res.status(500).json({ error: 'Reorder thất bại.' });
  }
};

export { recomputeCourseMeta };
