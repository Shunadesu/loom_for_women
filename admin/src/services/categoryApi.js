import api from './api.js';

// ─── Admin ───────────────────────────────────────────────────
export const fetchAllCategoriesAdmin = () =>
  api.get('/admin/categories').then((r) => r.data.items || []);

export const createCategoryAdmin = (payload) =>
  api.post('/admin/categories', payload).then((r) => r.data.category);

export const updateCategoryAdmin = (id, payload) =>
  api.put(`/admin/categories/${id}`, payload).then((r) => r.data.category);

export const deleteCategoryAdmin = (id) =>
  api.delete(`/admin/categories/${id}`).then((r) => r.data);

export const reorderCategoriesAdmin = (items) =>
  api.post('/admin/categories/reorder', { items }).then((r) => r.data.items || []);
