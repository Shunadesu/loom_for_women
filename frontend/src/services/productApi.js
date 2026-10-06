import api from './api.js';

// ─── Public ──────────────────────────────────────────────────
// Phase 1: Backend chưa có, throw để store dùng fallback mock.
// Phase 2: Khi backend mount /api/products, các hàm này sẽ trả data thật.

export const fetchProducts = (params = {}) =>
  api.get('/products', { params }).then((r) => r.data.items || []);

export const fetchProductBySlug = (slug) =>
  api.get(`/products/${encodeURIComponent(slug)}`).then((r) => r.data);

export const fetchProductCategories = () =>
  api.get('/product-categories').then((r) => r.data.items || []);

// ─── Admin ───────────────────────────────────────────────────
export const fetchAllProductsAdmin = () =>
  api.get('/admin/products').then((r) => r.data.items || []);

export const createProductAdmin = (formData) =>
  api
    .post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.product);

export const updateProductAdmin = (id, formData) =>
  api
    .put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.product);

export const deleteProductAdmin = (id) =>
  api.delete(`/admin/products/${id}`).then((r) => r.data);

export const reorderProductsAdmin = (items) =>
  api.post('/admin/products/reorder', { items }).then((r) => r.data.items || []);

// ─── Admin product category ─────────────────────────────────────
export const fetchAllProductCategoriesAdmin = () =>
  api.get('/admin/product-categories').then((r) => r.data.items || []);

export const createProductCategoryAdmin = (payload) =>
  api.post('/admin/product-categories', payload).then((r) => r.data.category);

export const updateProductCategoryAdmin = (id, payload) =>
  api.put(`/admin/product-categories/${id}`, payload).then((r) => r.data.category);

export const deleteProductCategoryAdmin = (id) =>
  api.delete(`/admin/product-categories/${id}`).then((r) => r.data);

export const reorderProductCategoriesAdmin = (items) =>
  api
    .post('/admin/product-categories/reorder', { items })
    .then((r) => r.data.items || []);