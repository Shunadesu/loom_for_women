import api from './api.js';

export const fetchLessonsByCourseAdmin = (courseId) =>
  api.get(`/admin/courses/${courseId}/lessons`).then((r) => r.data.items || []);

export const createLessonAdmin = (courseId, payload) =>
  api
    .post(`/admin/courses/${courseId}/lessons`, payload)
    .then((r) => r.data.lesson);

export const updateLessonAdmin = (id, payload) =>
  api.put(`/admin/lessons/${id}`, payload).then((r) => r.data.lesson);

export const deleteLessonAdmin = (id) =>
  api.delete(`/admin/lessons/${id}`).then((r) => r.data);

export const reorderLessonsAdmin = (courseId, items) =>
  api
    .post(`/admin/courses/${courseId}/lessons/reorder`, { items })
    .then((r) => r.data);