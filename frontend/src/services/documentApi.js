import api from './api.js';

// ─── Public ──────────────────────────────────────────────────

export const fetchDocuments = (params = {}) =>
  api.get('/documents', { params }).then((r) => r.data);

export const fetchCoursesWithDocuments = () =>
  api.get('/documents/courses').then((r) => r.data.items || []);

export const fetchDocumentDetail = (id) =>
  api.get(`/documents/${id}`).then((r) => r.data.document);

export const recordDownload = (id) =>
  api.post(`/documents/${id}/download`).then((r) => r.data);

// ─── Admin ───────────────────────────────────────────────────

export const listDocumentsByLessonAdmin = (lessonId) =>
  api
    .get(`/admin/lessons/${lessonId}/documents`)
    .then((r) => r.data.items || []);

export const createDocumentAdmin = (lessonId, formData) =>
  api
    .post(`/admin/lessons/${lessonId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.document);

export const updateDocumentAdmin = (id, payload) =>
  api.put(`/admin/documents/${id}`, payload).then((r) => r.data.document);

export const deleteDocumentAdmin = (id) =>
  api.delete(`/admin/documents/${id}`).then((r) => r.data);

export const reorderDocumentsAdmin = (items) =>
  api.post('/admin/documents/reorder', { items }).then((r) => r.data);