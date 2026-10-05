import api from './api.js';

export const markLessonComplete = (lessonId) =>
  api.post(`/progress/lessons/${lessonId}/complete`).then((r) => r.data);

export const fetchMyProgress = () =>
  api.get('/progress/me').then((r) => r.data);