import path from 'path';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import UserProgress from '../models/UserProgress.js';
import Favorite from '../models/Favorite.js';
import { safeUnlink, UPLOAD_COURSE_DIR } from '../middleware/upload.js';

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
  filename ? path.join(UPLOAD_COURSE_DIR, filename) : null;

/**
 * POST /api/progress/me — kèm req.user (optionalAuth có thể không có).
 * Trả về map { courseId: { progressPct, lastLessonId, isFavorite } }.
 */
async function buildProgressMap(userId) {
  if (!userId) return {};
  const progresses = await UserProgress.find({ userId }).lean();
  const favorites = await Favorite.find({ userId }).lean();
  const favSet = new Set(favorites.map((f) => String(f.courseId)));
  const map = {};
  for (const p of progresses) {
    map[String(p.courseId)] = {
      progressPct: p.progressPct,
      lastLessonId: p.lastLessonId ? String(p.lastLessonId) : null,
      isFavorite: favSet.has(String(p.courseId)),
      completedLessons: p.completedLessons.map((l) => String(l)),
    };
  }
  return map;
}

/**
 * GET /api/courses
 * Query:
 *   - status: 'all' | 'unstarted' | 'ongoing' | 'completed' | 'featured'
 *   - category: categoryId
 *   - q: search string (title + description)
 *   - limit, skip
 */
export const listCourses = async (req, res) => {
  try {
    const { status = 'all', category, q, featured, limit = 50, skip = 0 } = req.query;
    const filter = { isActive: true, isPublished: true };

    if (category) filter.category = category;
    if (q) {
      const safe = String(q).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
      ];
    }
    if (featured === 'true') filter.isFeatured = true;

    let courses = await Course.find(filter)
      .populate('category', 'name slug color')
      .sort({ order: 1, createdAt: -1 })
      .skip(Number(skip) || 0)
      .limit(Math.min(Number(limit) || 50, 100))
      .lean();

    // Lọc theo progress status
    if (status && status !== 'all' && status !== 'featured') {
      const progressMap = await buildProgressMap(req.user?._id);
      courses = courses.filter((c) => {
        const p = progressMap[String(c._id)];
        const pct = p?.progressPct ?? 0;
        if (status === 'unstarted') return pct === 0;
        if (status === 'ongoing') return pct > 0 && pct < 100;
        if (status === 'completed') return pct >= 100;
        return true;
      });
    }

    // Gắn progress + isFavorite cho mỗi course (kể cả 'all' / 'featured')
    if (req.user) {
      const progressMap = await buildProgressMap(req.user._id);
      courses = courses.map((c) => {
        const p = progressMap[String(c._id)] || {};
        return {
          ...c,
          progressPct: p.progressPct ?? 0,
          isFavorite: Boolean(p.isFavorite),
          lastLessonId: p.lastLessonId || null,
        };
      });
    } else {
      courses = courses.map((c) => ({
        ...c,
        progressPct: 0,
        isFavorite: false,
        lastLessonId: null,
      }));
    }

    res.json({ items: courses });
  } catch (err) {
    console.error('listCourses error', err);
    res.status(500).json({ error: 'Không lấy được danh sách khóa học.' });
  }
};

/**
 * GET /api/courses/:slug
 * Trả về course detail + lessons.
 */
export const getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      isActive: true,
      isPublished: true,
    })
      .populate('category', 'name slug color')
      .lean();

    if (!course) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
    }

    const lessons = await Lesson.find({ courseId: course._id })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    let myProgress = null;
    if (req.user) {
      const p = await UserProgress.findOne({
        userId: req.user._id,
        courseId: course._id,
      }).lean();
      if (p) {
        myProgress = {
          progressPct: p.progressPct,
          lastLessonId: p.lastLessonId ? String(p.lastLessonId) : null,
          completedLessons: p.completedLessons.map((l) => String(l)),
        };
      }
    }

    res.json({
      course: {
        ...course,
        lessons,
      },
      myProgress: myProgress || {
        progressPct: 0,
        lastLessonId: null,
        completedLessons: [],
      },
    });
  } catch (err) {
    console.error('getCourseBySlug error', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// ─── Internal helpers dùng cho admin / progress ─────────────
export { filenameFromUrl, absFromFilename };