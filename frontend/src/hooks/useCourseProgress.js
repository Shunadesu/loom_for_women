import { useProgressStore } from '../store/progressStore.js';

/**
 * % tiến trình học tập của 1 khóa học (dùng chung cho badge + nút progress).
 *
 * Lấy max của:
 *   1. progressStore.byCourse — dữ liệu vừa cập nhật tức thì trong phiên hiện tại.
 *   2. course.progressPct      — giá trị API trả về kèm danh sách khóa học.
 *
 * @param {object} course
 * @returns {number} 0 → chưa học
 */
export function useCourseProgress(course) {
  const byCourse = useProgressStore((s) => s.byCourse);

  const localPct = Number(byCourse[String(course?._id)]?.progressPct) || 0;
  const apiPct = Number(course?.progressPct) || 0;

  return Math.max(localPct, apiPct);
}

/**
 * Bài học đang học dở (để deep-link đúng bài).
 * Ưu tiên store cục bộ (vừa học xong trong phiên hiện tại),
 * fallback sang giá trị API trả kèm course.
 */
export function useCourseLastLessonId(course) {
  const byCourse = useProgressStore((s) => s.byCourse);

  return (
    byCourse[String(course?._id)]?.lastLessonId || course?.lastLessonId || null
  );
}
