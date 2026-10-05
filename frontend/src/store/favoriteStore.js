import { create } from 'zustand';
import {
  addFavorite,
  removeFavorite,
  fetchMyFavorites,
} from '../services/favoriteApi.js';

export const useFavoriteStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchMyFavorites();
      set({ items, loading: false });
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được yêu thích.',
        loading: false,
      });
    }
  },

  add: async (courseId) => {
    try {
      await addFavorite(courseId);
      // Refetch list để có đầy đủ data populate
      return get().fetch();
    } catch (err) {
      throw err;
    }
  },

  remove: async (courseId) => {
    try {
      await removeFavorite(courseId);
      set({
        items: get().items.filter((c) => String(c._id) !== String(courseId)),
      });
    } catch (err) {
      throw err;
    }
  },
}));