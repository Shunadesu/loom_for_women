import mongoose from 'mongoose';
import UserProgress from '../models/UserProgress.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Favorite from '../models/Favorite.js';
import Certificate from '../models/Certificate.js';
import { completeLessonForUser } from '../services/lessonCompletionService.js';

/**
 * POST /api/progress/lessons/:lessonId/complete
 * optionalAuth — nếu chưa login thì báo lỗi (vì cần userId để lưu).
 */
export const markLessonComplete = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập để lưu tiến độ.' });
    }
    const lessonId = req.params.lessonId;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: 'Lesson ID không hợp lệ.' });
    }
    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) {
      return res.status(404).json({ error: 'Không tìm thấy bài học.' });
    }

    const result = await completeLessonForUser(req.user._id, lesson);

    res.json({
      ok: true,
      progressPct: result.progressPct,
      completedCount: result.completedCount,
      totalLessons: result.totalLessons,
      certificateCreated: result.certificateCreated,
    });
  } catch (err) {
    console.error('markLessonComplete error', err);
    res.status(500).json({ error: 'Không lưu được tiến độ.' });
  }
};

/**
 * GET /api/progress/me
 */
export const myProgress = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập.' });
    }
    const progresses = await UserProgress.find({ userId: req.user._id })
      .populate('courseId', 'title slug thumbnail')
      .sort({ updatedAt: -1 })
      .lean();
    const favorites = await Favorite.find({ userId: req.user._id }).lean();
    res.json({ items: progresses, favoriteCourseIds: favorites.map((f) => String(f.courseId)) });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

/**
 * GET /api/progress/me/stats
 * Trả về thống kê học tập của user hiện tại:
 *   - ongoing: số khóa đang học dở (0 < pct < 100)
 *   - completed: số khóa đã hoàn tất (pct >= 100)
 *   - totalMinutes: tổng phút của các khóa đã tick ít nhất 1 bài
 *   - certificatesCount: số chứng chỉ đã cấp
 *   - favoriteCount: số khóa đã yêu thích
 */
export const myStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập.' });
    }
    const userId = req.user._id;

    const progresses = await UserProgress.find({ userId })
      .populate('courseId', 'title slug thumbnail durationMinutes')
      .lean();

    let ongoing = 0;
    let completed = 0;
    let totalMinutes = 0;
    const seenCourses = new Set();

    for (const p of progresses) {
      const pct = p.progressPct || 0;
      if (pct >= 100) completed += 1;
      else if (pct > 0) ongoing += 1;
      if (pct > 0 && p.courseId && !seenCourses.has(String(p.courseId._id))) {
        totalMinutes += Number(p.courseId.durationMinutes) || 0;
        seenCourses.add(String(p.courseId._id));
      }
    }

    const [certificatesCount, favoriteCount] = await Promise.all([
      Certificate.countDocuments({ userId }),
      Favorite.countDocuments({ userId }),
    ]);

    res.json({
      ongoing,
      completed,
      totalMinutes,
      certificatesCount,
      favoriteCount,
    });
  } catch (err) {
    console.error('myStats error', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

/**
 * GET /api/progress/me/continue
 * Trả về 1 khóa học đang học dở gần nhất (theo lastWatchedAt).
 * Trả null nếu không có hoặc đã hoàn tất tất cả.
 */
export const getContinueLearning = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập.' });
    }
    const progress = await UserProgress.findOne({
      userId: req.user._id,
      progressPct: { $gt: 0, $lt: 100 },
    })
      .sort({ lastWatchedAt: -1, updatedAt: -1 })
      .populate({
        path: 'courseId',
        select: 'title slug thumbnail durationMinutes lessonsCount',
      })
      .populate('lastLessonId', 'title order')
      .lean();

    if (!progress || !progress.courseId) {
      return res.json({ item: null });
    }

    res.json({
      item: {
        courseId: String(progress.courseId._id),
        slug: progress.courseId.slug,
        title: progress.courseId.title,
        thumbnail: progress.courseId.thumbnail,
        durationMinutes: progress.courseId.durationMinutes || 0,
        lessonsCount: progress.courseId.lessonsCount || 0,
        progressPct: progress.progressPct || 0,
        lastLessonId: progress.lastLessonId
          ? String(progress.lastLessonId._id || progress.lastLessonId)
          : null,
        lastWatchedAt: progress.lastWatchedAt || null,
      },
    });
  } catch (err) {
    console.error('getContinueLearning error', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};