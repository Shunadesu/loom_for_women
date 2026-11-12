import Lesson from '../models/Lesson.js';
import UserProgress from '../models/UserProgress.js';
import Course from '../models/Course.js';
import PointTransaction from '../models/PointTransaction.js';
import { awardPoints, POINT_RULES, getUserPoints } from '../utils/points.js';
import { issueCertificateIfNeeded } from '../utils/certificate.js';

/**
 * Đánh dấu hoàn thành 1 bài học cho user.
 * - Cập nhật UserProgress (completedLessons, lastLessonId, progressPct)
 * - Cộng điểm lesson_complete (chống double-count theo PointTransaction)
 * - Khi đạt 100% → cấp Certificate + cộng điểm course_finish
 *
 * @returns {{progressPct:number, completedCount:number, totalLessons:number, certificateCreated:boolean}}
 */
export async function completeLessonForUser(userId, lesson) {
  const courseId = lesson.courseId;

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

  const totalLessons = await Lesson.countDocuments({ courseId });
  const pct =
    totalLessons > 0
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;
  progress.progressPct = pct;
  await progress.save();

  // Điểm hoàn thành bài học — chỉ cộng lần đầu
  const txCount = await PointTransaction.countDocuments({
    userId,
    type: 'lesson_complete',
    refId: String(lesson._id),
  });
  if (txCount === 0) {
    await awardPoints({
      userId,
      delta: POINT_RULES.LESSON_COMPLETE,
      type: 'lesson_complete',
      refId: String(lesson._id),
      description: `Hoàn thành bài học: ${lesson.title}`,
    });
  }

  // Đạt 100% → cấp chứng chỉ + điểm course_finish (200đ, hard-code).
  // Điểm khóa học ĐỘC LẬP với việc tạo chứng chỉ: chỉ cần chưa từng cộng
  // type=course_finish cho khóa này thì cộng ngay, kể cả khi chứng chỉ đã
  // tồn tại từ trước (tránh mất điểm oan).
  let certificateCreated = false;
  let awardedCourse = 0;
  if (pct >= 100) {
    const certResult = await issueCertificateIfNeeded(userId, courseId);
    certificateCreated = certResult.created;
    const courseFinishCount = await PointTransaction.countDocuments({
      userId,
      type: 'course_finish',
      refId: String(courseId),
    });
    if (courseFinishCount === 0) {
      const course = await Course.findById(courseId).lean();
      await awardPoints({
        userId,
        delta: POINT_RULES.COURSE_FINISH,
        type: 'course_finish',
        refId: String(courseId),
        description: `Hoàn thành khóa học: ${course?.title || ''}`,
      });
      awardedCourse = POINT_RULES.COURSE_FINISH;
    }
  }

  const totalPoints = await getUserPoints(userId);

  return {
    progressPct: pct,
    completedCount: progress.completedLessons.length,
    totalLessons,
    certificateCreated,
    awardedCourse,
    totalPoints,
  };
}
