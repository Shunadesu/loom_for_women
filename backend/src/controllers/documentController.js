import path from 'path';
import LessonDocument from '../models/LessonDocument.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import UserProgress from '../models/UserProgress.js';
import { UPLOAD_DOC_DIR } from '../middleware/upload.js';

const publicUrlFor = (filename) => {
  const base = process.env.PUBLIC_BASE_URL || 'https://sunnydemo.site';
  return `${base}/uploads/documents/${filename}`;
};

const filenameFromUrl = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').pop();
    return last || null;
  } catch {
    return null;
  }
};

const absFromFilename = (filename) =>
  filename ? path.join(UPLOAD_DOC_DIR, filename) : null;

const buildProgressMap = async (userId) => {
  if (!userId) return {};
  const progresses = await UserProgress.find({ userId }).lean();
  const map = {};
  for (const p of progresses) {
    map[String(p.courseId)] = {
      progressPct: p.progressPct ?? 0,
    };
  }
  return map;
};

/**
 * GET /api/documents
 * Query:
 *   - q: search title/description
 *   - courseId: lọc theo khóa
 *   - lessonId: lọc theo bài
 *   - format: pdf|excel|infographic|guide
 *   - progress: all|ongoing|completed (cần login)
 *   - limit, skip
 */
export const listDocuments = async (req, res) => {
  try {
    const {
      q,
      courseId,
      lessonId,
      format,
      progress,
      limit = 50,
      skip = 0,
    } = req.query;

    const filter = { isPublished: true };
    if (courseId) filter.courseId = courseId;
    if (lessonId) filter.lessonId = lessonId;
    if (format && ['pdf', 'excel', 'infographic', 'guide'].includes(format)) {
      filter.fileType = format;
    }
    if (q) {
      const safe = String(q).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
      ];
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const safeSkip = Math.max(Number(skip) || 0, 0);

    let items = await LessonDocument.find(filter)
      .populate('lessonId', 'title order')
      .populate('courseId', 'title slug thumbnail category')
      .sort({ createdAt: -1 })
      .skip(safeSkip)
      .limit(safeLimit)
      .lean();

    // Lọc theo progress
    if (progress && ['ongoing', 'completed'].includes(progress) && req.user) {
      const progressMap = await buildProgressMap(req.user._id);
      items = items.filter((doc) => {
        const cid = doc.courseId?._id ? String(doc.courseId._id) : null;
        const pct = cid ? progressMap[cid]?.progressPct ?? 0 : 0;
        if (progress === 'ongoing') return pct > 0 && pct < 100;
        if (progress === 'completed') return pct >= 100;
        return true;
      });
    }

    // Gắn courseProgressPct cho mỗi doc (null nếu user chưa login)
    if (req.user) {
      const progressMap = await buildProgressMap(req.user._id);
      items = items.map((d) => {
        const cid = d.courseId?._id ? String(d.courseId._id) : null;
        return {
          ...d,
          courseProgressPct: cid ? progressMap[cid]?.progressPct ?? 0 : 0,
        };
      });
    } else {
      items = items.map((d) => ({ ...d, courseProgressPct: null }));
    }

    const total = await LessonDocument.countDocuments(filter);
    res.json({ items, total, limit: safeLimit, skip: safeSkip });
  } catch (err) {
    console.error('listDocuments error', err);
    res.status(500).json({ error: 'Không lấy được danh sách tài liệu.' });
  }
};

/**
 * GET /api/documents/courses — list courses có tài liệu (cho filter chip).
 */
export const listCoursesWithDocuments = async (_req, res) => {
  try {
    const courseIds = await LessonDocument.distinct('courseId', { isPublished: true });
    const items = await Course.find({
      _id: { $in: courseIds },
      isActive: true,
      isPublished: true,
    })
      .select('title slug thumbnail')
      .sort({ title: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

/**
 * GET /api/documents/lesson/:lessonId
 */
export const listDocumentsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const items = await LessonDocument.find({ lessonId, isPublished: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

/**
 * GET /api/documents/:id
 */
export const getDocumentDetail = async (req, res) => {
  try {
    const doc = await LessonDocument.findOne({ _id: req.params.id, isPublished: true })
      .populate('lessonId', 'title order')
      .populate('courseId', 'title slug thumbnail category')
      .lean();
    if (!doc) return res.status(404).json({ error: 'Không tìm thấy tài liệu.' });

    let courseProgressPct = null;
    if (req.user && doc.courseId?._id) {
      const p = await UserProgress.findOne({
        userId: req.user._id,
        courseId: doc.courseId._id,
      }).lean();
      courseProgressPct = p?.progressPct ?? 0;
    }
    res.json({ document: { ...doc, courseProgressPct } });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

/**
 * POST /api/documents/:id/download — tăng counter và trả fileUrl.
 */
export const recordDownload = async (req, res) => {
  try {
    const doc = await LessonDocument.findById(req.params.id);
    if (!doc || !doc.isPublished) {
      return res.status(404).json({ error: 'Không tìm thấy tài liệu.' });
    }
    doc.downloadCount += 1;
    await doc.save();
    res.json({ fileUrl: doc.fileUrl, title: doc.title });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

export {
  publicUrlFor,
  filenameFromUrl,
  absFromFilename,
};