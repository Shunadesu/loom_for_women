import api from './api.js';

// ─── Public ───────────────────────────────────────────────────
export const fetchActiveHeroes = () =>
  api.get('/heroes').then((r) => r.data.items || []);

// ─── Admin ────────────────────────────────────────────────────
export const fetchAllHeroes = () =>
  api.get('/admin/heroes').then((r) => r.data.items || []);

export const createHero = (formData) =>
  api
    .post('/admin/heroes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.hero);

export const updateHero = (id, formData) =>
  api
    .put(`/admin/heroes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.hero);

export const deleteHero = (id) =>
  api.delete(`/admin/heroes/${id}`).then((r) => r.data);

export const reorderHeroes = (items) =>
  api.post('/admin/heroes/reorder', { items }).then((r) => r.data.items || []);