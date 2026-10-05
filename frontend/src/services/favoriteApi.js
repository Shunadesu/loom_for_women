import api from './api.js';

export const addFavorite = (courseId) =>
  api.post(`/favorites/courses/${courseId}`).then((r) => r.data);

export const removeFavorite = (courseId) =>
  api.delete(`/favorites/courses/${courseId}`).then((r) => r.data);

export const fetchMyFavorites = () =>
  api.get('/favorites/me').then((r) => r.data.items || []);