import api from './api.js';

/**
 * Document API (admin)
 */

export async function listDocumentsByLessonAdmin(lessonId) {
  const res = await api.get(`/api/admin/lessons/${lessonId}/documents`);
  return res.data;
}

export async function createDocumentAdmin(lessonId, formData) {
  const res = await api.post(`/api/admin/lessons/${lessonId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateDocumentAdmin(documentId, payload) {
  const res = await api.put(`/api/admin/documents/${documentId}`, payload);
  return res.data;
}

export async function deleteDocumentAdmin(documentId) {
  const res = await api.delete(`/api/admin/documents/${documentId}`);
  return res.data;
}
