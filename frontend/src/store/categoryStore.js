import { create } from 'zustand';
import { fetchActiveCategories } from '../services/categoryApi.js';

export const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchActiveCategories();
      set({ categories: items, loading: false });
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được danh mục.',
        loading: false,
      });
    }
  },
}));