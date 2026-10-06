import api from './api.js';

export const fetchAllCoursesAdmin = () =>
  api.get('/admin/courses').then((r) => r.data.items || []);

export const createCourseAdmin = (payload) =>
  api.post('/admin/courses', payload).then((r) => r.data.course);

export const updateCourseAdmin = (id, payload) =>
  api.put(`/admin/courses/${id}`, payload).then((r) => r.data.course);

export const deleteCourseAdmin = (id) =>
  api.delete(`/admin/courses/${id}`).then((r) => r.data);

export const fetchAllCategoriesAdmin = () =>
  api.get('/admin/categories').then((r) => r.data.items || []);

export const createCategoryAdmin = (payload) =>
  api.post('/admin/categories', payload).then((r) => r.data.category);

export const updateCategoryAdmin = (id, payload) =>
  api.put(`/admin/categories/${id}`, payload).then((r) => r.data.category);

export const deleteCategoryAdmin = (id) =>
  api.delete(`/admin/categories/${id}`).then((r) => r.data);

export const fetchLessonsAdmin = (courseId) =>
  api.get(`/admin/courses/${courseId}/lessons`).then((r) => r.data.items || []);

export const createLessonAdmin = (courseId, payload) =>
  api.post(`/admin/courses/${courseId}/lessons`, payload).then((r) => r.data.lesson);

export const updateLessonAdmin = (courseId, lessonId, payload) =>
  api.put(`/admin/courses/${courseId}/lessons/${lessonId}`, payload).then((r) => r.data.lesson);

export const deleteLessonAdmin = (courseId, lessonId) =>
  api.delete(`/admin/courses/${courseId}/lessons/${lessonId}`).then((r) => r.data);