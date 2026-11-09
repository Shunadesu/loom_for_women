import api from './api.js';

/**
 * API cho luồng "Nhập Bài Học 4 phần".
 * Mount tại /api/admin/intake (xem backend/src/routes/adminCourseIntake.js).
 */

/**
 * Tạo khóa học + bài học đầu tiên đủ 4 phần.
 * @param {FormData} formData
 */
export const createCourseWithLesson = (formData) =>
  api
    .post('/admin/intake', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

/**
 * Cập nhật bài học + 4 phần nội dung.
 * @param {string} lessonId
 * @param {FormData} formData
 */
export const updateLessonContent = (lessonId, formData) =>
  api
    .put(`/admin/intake/lessons/${lessonId}/intake`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

/** Lấy nội dung 4 phần của 1 bài học. */
export const fetchLessonContent = (lessonId) =>
  api.get(`/admin/intake/lessons/${lessonId}/content`).then((r) => r.data);

/** Lấy toàn bộ bài học + 4 phần của 1 khóa học. */
export const fetchCourseContent = (courseId) =>
  api.get(`/admin/intake/courses/${courseId}/content`).then((r) => r.data);

/** Xoá sạch nội dung 4 phần (giữ bài học). */
export const clearLessonContent = (lessonId) =>
  api.delete(`/admin/intake/lessons/${lessonId}/content`).then((r) => r.data);
