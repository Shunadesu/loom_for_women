import api from './api.js';

// ─── Public ──────────────────────────────────────────────────
export const fetchCourses = (params = {}) =>
  api.get('/courses', { params }).then((r) => r.data.items || []);

export const fetchCourseBySlug = (slug) =>
  api.get(`/courses/${encodeURIComponent(slug)}`).then((r) => r.data);

// ─── Admin ───────────────────────────────────────────────────
export const fetchAllCoursesAdmin = () =>
  api.get('/admin/courses').then((r) => r.data.items || []);

export const createCourseAdmin = (formData) =>
  api
    .post('/admin/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.course);

export const updateCourseAdmin = (id, formData) =>
  api
    .put(`/admin/courses/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.course);

export const deleteCourseAdmin = (id) =>
  api.delete(`/admin/courses/${id}`).then((r) => r.data);

export const reorderCoursesAdmin = (items) =>
  api.post('/admin/courses/reorder', { items }).then((r) => r.data.items || []);