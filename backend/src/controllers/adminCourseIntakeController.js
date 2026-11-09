import path from 'path';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import { safeUnlink, UPLOAD_LESSON_DIR } from '../middleware/upload.js';
import { slugify } from '../utils/slugify.js';
import { extractYoutubeId } from '../utils/youtube.js';
import { normalizeCategory } from '../utils/categories.js';
import {
  parseJsonField,
  replaceSlides,
  replaceQuizzes,
  replaceSimulations,
  replaceSummary,
  getLessonContentMap,
  purgeLessonContent,
} from '../services/lessonContentService.js';

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

const removeFileByUrl = (url) => {
  const name = filenameFromUrl(url);
  if (name) safeUnlink(absFromFilename(name));
};

const clean = (value, max = 1000) =>
  String(value ?? '').trim().slice(0, max);

const ensureUniqueSlug = async (base, excludeId = null) => {
  let slug = base || `course-${Date.now()}`;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Course.findOne({ slug, _id: { $ne: excludeId } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

const recomputeCourseMeta = async (courseId) => {
  const count = await Lesson.countDocuments({ courseId });
  const lessons = await Lesson.find({ courseId }).lean();
  const totalSeconds = lessons.reduce(
    (acc, l) => acc + (Number(l.durationSeconds) || 0),
    0
  );
  // Không ghi đè thời lượng do admin nhập tay khi chưa có bài học nào khai báo durationSeconds.
  const computedMinutes = Math.round(totalSeconds / 60);
  const update = { lessonsCount: count };
  if (computedMinutes > 0) update.durationMinutes = computedMinutes;
  await Course.findByIdAndUpdate(courseId, update);
};

/**
 * Đọc 4 phần nội dung từ body (FormData) — dùng chung cho create & update.
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
    slides,
    quizzes,
    simulations,
    summary: {
      format: summary.format,
      imageUrl: summaryImageFile
        ? publicUrlFor(summaryImageFile.filename)
        : clean(summary.imageUrl, 1000),
      videoUrl: clean(summary.videoUrl, 1000),
      title: clean(summary.title, 300),
      pdfUrl: summaryPdfFile
        ? publicUrlFor(summaryPdfFile.filename)
        : clean(summary.pdfUrl, 1000),
      pdfName: summaryPdfFile
        ? clean(summaryPdfFile.originalname, 300)
        : clean(summary.pdfName, 300),
    },
    slidePdfFile,
    summaryImageFile,
    summaryPdfFile,
  };
};

/**
 * POST /api/admin/courses/intake
 * Tạo khóa học mới + bài học đầu tiên đầy đủ 4 phần trong 1 request.
 */
export const createCourseWithLesson = async (req, res) => {
  try {
    const body = req.body || {};
    const title = clean(body.title, 200);
    if (!title) return res.status(400).json({ error: 'Thiếu tiêu đề khóa học.' });

    const lessonTitle = clean(body.lessonTitle, 200);
    if (!lessonTitle) {
      return res.status(400).json({ error: 'Thiếu tên bài học.' });
    }

    const content = readContentPayload(body, req.files || {});

    const thumbnail = clean(body.thumbnail, 1000);
    const coverUrl = clean(body.coverUrl, 1000);
    if (!thumbnail && !coverUrl) {
      return res.status(400).json({
        error: 'Thiếu ảnh bìa khóa học (dán URL ảnh bìa).',
      });
    }

    const slug = await ensureUniqueSlug(slugify(title));
    const durationMinutes = Math.max(0, Number(body.durationMinutes) || 0);

    const course = await Course.create({
      title,
      slug,
      description: clean(body.description, 2000),
      category: normalizeCategory(body.category),
      thumbnail: thumbnail || coverUrl,
      coverUrl,
      bannerUrl: clean(body.bannerUrl, 1000),
      videoId: extractYoutubeId(body.videoUrl) || '',
      rating: Math.max(0, Math.min(5, Number(body.rating) || 0)),
      durationMinutes,
      isPublished: body.isPublished === 'false' || body.isPublished === false ? false : true,
      isFeatured: body.isFeatured === 'true' || body.isFeatured === true,
      isActive: true,
      order: Number.isFinite(+body.order) ? +body.order : 0,
    });

    const lesson = await Lesson.create({
      courseId: course._id,
      title: lessonTitle,
      contentType: 'video',
      knowledgeTitle: clean(body.knowledgeTitle, 300) || lessonTitle,
      knowledgeContent: clean(body.knowledgeContent, 8000),
      slidePdfUrl: content.slidePdfFile
        ? publicUrlFor(content.slidePdfFile.filename)
        : '',
      slidePdfName: content.slidePdfFile
        ? clean(content.slidePdfFile.originalname, 300)
        : '',
      slidePdfTitle: clean(body.slidePdfTitle, 300),
      durationSeconds: Math.max(0, Number(body.durationSeconds) || 0),
      order: 0,
    });

    await replaceSlides(lesson._id, course._id, content.slides);
    await replaceQuizzes(lesson._id, course._id, content.quizzes);
    await replaceSimulations(lesson._id, course._id, content.simulations);
    await replaceSummary(lesson._id, course._id, content.summary);

    await recomputeCourseMeta(course._id);

    const populated = await Course.findById(course._id).lean();
    res.status(201).json({ course: populated, lesson });
  } catch (err) {
    console.error('createCourseWithLesson error', err);
    res.status(500).json({ error: 'Tạo khóa học thất bại.' });
  }
};

/**
 * PUT /api/admin/lessons/:id/intake
 * Cập nhật bài học + 4 phần nội dung.
 */
export const updateLessonWithContent = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học.' });

    const body = req.body || {};
    const content = readContentPayload(body, req.files || {});

    if (body.lessonTitle) lesson.title = clean(body.lessonTitle, 200);
    if (body.knowledgeTitle !== undefined) {
      lesson.knowledgeTitle = clean(body.knowledgeTitle, 300);
    }
    if (body.knowledgeContent !== undefined) {
      lesson.knowledgeContent = clean(body.knowledgeContent, 8000);
    }
    if (body.slidePdfTitle !== undefined) {
      lesson.slidePdfTitle = clean(body.slidePdfTitle, 300);
    }
    if (body.durationSeconds !== undefined) {
      lesson.durationSeconds = Math.max(0, Number(body.durationSeconds) || 0);
    }

    if (content.slidePdfFile) {
      const oldPdf = lesson.slidePdfUrl;
      lesson.slidePdfUrl = publicUrlFor(content.slidePdfFile.filename);
      lesson.slidePdfName = clean(content.slidePdfFile.originalname, 300);
      if (oldPdf && oldPdf !== lesson.slidePdfUrl) removeFileByUrl(oldPdf);
    }

    await lesson.save();

    await replaceSlides(lesson._id, lesson.courseId, content.slides);
    await replaceQuizzes(lesson._id, lesson.courseId, content.quizzes);
    await replaceSimulations(lesson._id, lesson.courseId, content.simulations);
    await replaceSummary(lesson._id, lesson.courseId, content.summary);

    await recomputeCourseMeta(lesson.courseId);

    res.json({ lesson });
  } catch (err) {
    console.error('updateLessonWithContent error', err);
    res.status(500).json({ error: 'Cập nhật bài học thất bại.' });
  }
};

/**
 * GET /api/admin/lessons/:id/content
 * Trả về 4 phần nội dung của 1 bài học (dùng cho form sửa).
 */
export const getLessonContent = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).lean();
    if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học.' });

    const map = await getLessonContentMap([lesson._id]);
    const content = map.get(String(lesson._id)) || {
      slides: [],
      quizzes: [],
      simulations: [],
      summary: null,
    };
    res.json({ lesson, content });
  } catch (err) {
    console.error('getLessonContent error', err);
    res.status(500).json({ error: 'Không tải được nội dung bài học.' });
  }
};

/**
 * GET /api/admin/courses/:courseId/content
 * Trả về toàn bộ bài học + 4 phần của 1 khóa học.
 */
export const getCourseContent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).lean();
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa học.' });

    const lessons = await Lesson.find({ courseId: course._id })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const map = await getLessonContentMap(lessons.map((l) => l._id));
    const items = lessons.map((l) => ({
      ...l,
      content: map.get(String(l._id)) || {
        slides: [],
        quizzes: [],
        simulations: [],
        summary: null,
      },
    }));

    res.json({ course, items });
  } catch (err) {
    console.error('getCourseContent error', err);
    res.status(500).json({ error: 'Không tải được nội dung khóa học.' });
  }
};

/**
 * DELETE /api/admin/lessons/:id/content
 * Xoá toàn bộ nội dung 4 phần (giữ lại lesson).
 */
export const clearLessonContent = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học.' });
    await purgeLessonContent(lesson._id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Xoá nội dung thất bại.' });
  }
};

/**
 * DELETE /api/admin/courses/:courseId/lessons/:lessonId
 * Xoá 1 bài học kèm 4 phần nội dung.
 */
export const deleteLessonWithContent = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học.' });

    const courseId = lesson.courseId;
    removeFileByUrl(lesson.slidePdfUrl);
    await purgeLessonContent(lesson._id);
    await lesson.deleteOne();
    await recomputeCourseMeta(courseId);
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteLessonWithContent error', err);
    res.status(500).json({ error: 'Xoá bài học thất bại.' });
  }
};

export { recomputeCourseMeta };
