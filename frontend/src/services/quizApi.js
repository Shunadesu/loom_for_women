import api from './api.js';

/**
 * API trắc nghiệm cho học viên.
 * Backend mount tại /api/progress (xem backend/src/routes/progress.js).
 */

/** Lấy câu hỏi trắc nghiệm của 1 bài học (không kèm đáp án đúng). */
export const fetchLessonQuiz = (lessonId) =>
  api.get(`/progress/lessons/${lessonId}/quiz`).then((r) => r.data);

/**
 * Nộp đáp án.
 * @param {string} lessonId
 * @param {string} quizId
 * @param {string} answer - 'A' | 'B' | 'C' | 'D'
 * @param {boolean} complete - có tick hoàn thành bài học khi đúng (mặc định true)
 */
export const submitQuizAnswer = (lessonId, quizId, answer, complete = true) =>
  api
    .post(`/progress/lessons/${lessonId}/quiz`, { quizId, answer, complete })
    .then((r) => r.data);
