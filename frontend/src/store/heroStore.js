import { create } from 'zustand';
import {
  fetchActiveHeroes,
  fetchAllHeroes,
  createHero,
  updateHero,
  deleteHero,
  reorderHeroes,
} from '../services/heroApi.js';

const sortByOrder = (arr) =>
  [...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt < b.createdAt ? -1 : 1);

export const useHeroStore = create((set, get) => ({
  heroes: [],
  loading: false,
  error: null,

  /** Public — lấy danh sách active cho Home */
  fetchPublic: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchActiveHeroes();
      set({ heroes: items, loading: false });
    } catch (err) {
      set({ error: err?.response?.data?.error || 'Lỗi tải hero.', loading: false });
    }
  },

  /** Admin — lấy tất cả (kể cả inactive) */
  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchAllHeroes();
      set({ heroes: sortByOrder(items), loading: false });
    } catch (err) {
      set({ error: err?.response?.data?.error || 'Lỗi tải hero.', loading: false });
    }
  },

  create: async (formData) => {
    const hero = await createHero(formData);
    set({ heroes: sortByOrder([hero, ...get().heroes]) });
    return hero;
  },

  update: async (id, formData) => {
    const hero = await updateHero(id, formData);
    set({
      heroes: sortByOrder(get().heroes.map((h) => (h._id === id ? hero : h))),
    });
    return hero;
  },

  remove: async (id) => {
    await deleteHero(id);
    set({ heroes: get().heroes.filter((h) => h._id !== id) });
  },

  reorder: async (items) => {
    const list = await reorderHeroes(items);
    set({ heroes: sortByOrder(list) });
  },
}));