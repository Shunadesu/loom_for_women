import api from './api.js';

export const markLessonComplete = (lessonId) =>
  api.post(`/progress/lessons/${lessonId}/complete`).then((r) => r.data);

export const fetchMyProgress = () =>
  api.get('/progress/me').then((r) => r.data);

export const fetchMyStats = () =>
  api.get('/progress/me/stats').then((r) => r.data);

export const fetchContinueLearning = () =>
  api.get('/progress/me/continue').then((r) => r.data);