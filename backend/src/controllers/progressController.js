import mongoose from 'mongoose';
import UserProgress from '../models/UserProgress.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Favorite from '../models/Favorite.js';
import { awardPoints, POINT_RULES } from '../utils/points.js';
import { issueCertificateIfNeeded } from '../utils/certificate.js';

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

    const courseId = lesson.courseId;
    const userId = req.user._id;

    let progress = await UserProgress.findOne({ userId, courseId });
    if (!progress) {
      progress = await UserProgress.create({
        userId,
        courseId,
        completedLessons: [lesson._id],
        lastLessonId: lesson._id,
        lastWatchedAt: new Date(),
        progressPct: 0,
      });
    } else {
      if (!progress.completedLessons.some((id) => String(id) === String(lesson._id))) {
        progress.completedLessons.push(lesson._id);
      }
      progress.lastLessonId = lesson._id;
      progress.lastWatchedAt = new Date();
      await progress.save();
    }

    // Tính lại progressPct
    const totalLessons = await Lesson.countDocuments({ courseId });
    const pct = totalLessons > 0
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;
    progress.progressPct = pct;
    await progress.save();

    // Cộng điểm cho lần complete lesson đầu tiên (không cộng nếu tick lại)
    const alreadyCompleted = progress.completedLessons.length === totalLessons
      ? false
      : true; // chỉ là hint, không quan trọng
    void alreadyCompleted;

    // Đếm số lần đã award lesson_complete cho lesson này (chống double-count)
    const txCount = await import('../models/PointTransaction.js').then((m) =>
      m.default.countDocuments({
        userId,
        type: 'lesson_complete',
        refId: String(lesson._id),
      })
    );
    if (txCount === 0) {
      await awardPoints({
        userId,
        delta: POINT_RULES.LESSON_COMPLETE,
        type: 'lesson_complete',
        refId: String(lesson._id),
        description: `Hoàn thành bài học: ${lesson.title}`,
      });
    }

    // Nếu đạt 100% → cấp Certificate + cộng điểm course_finish (chống double)
    if (pct >= 100) {
      const certResult = await issueCertificateIfNeeded(userId, courseId);
      if (certResult.created) {
        const courseFinishTxCount = await import('../models/PointTransaction.js').then(
          (m) =>
            m.default.countDocuments({
              userId,
              type: 'course_finish',
              refId: String(courseId),
            })
        );
        if (courseFinishTxCount === 0) {
          const course = await Course.findById(courseId).lean();
          await awardPoints({
            userId,
            delta: POINT_RULES.COURSE_FINISH,
            type: 'course_finish',
            refId: String(courseId),
            description: `Hoàn thành khóa học: ${course?.title || ''}`,
          });
        }
      }
    }

    res.json({
      ok: true,
      progressPct: pct,
      completedCount: progress.completedLessons.length,
      totalLessons,
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
      .populate('courseId', 'title slug thumbnail category')
      .sort({ updatedAt: -1 })
      .lean();
    const favorites = await Favorite.find({ userId: req.user._id }).lean();
    res.json({ items: progresses, favoriteCourseIds: favorites.map((f) => String(f.courseId)) });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};