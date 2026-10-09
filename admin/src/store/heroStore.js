import { create } from 'zustand';
import {
  fetchAllHeroes,
  createHero,
  updateHero,
  deleteHero,
  reorderHeroes,
} from '../services/heroApi.js';
import { toRelativeImageUrl } from '../utils/imageUrl.js';

const normalize = (h) => (h ? { ...h, imageUrl: toRelativeImageUrl(h.imageUrl) } : h);
const normalizeAll = (arr) => arr.map(normalize);

const sortByOrder = (arr) =>
  [...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.createdAt < b.createdAt ? -1 : 1));

export const useHeroStore = create((set, get) => ({
  heroes: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchAllHeroes();
      set({ heroes: sortByOrder(normalizeAll(items)), loading: false });
    } catch (err) {
      set({ error: err?.response?.data?.error || 'Lỗi tải hero.', loading: false });
    }
  },

  create: async (formData) => {
    const hero = await createHero(formData);
    set({ heroes: sortByOrder([normalize(hero), ...get().heroes]) });
    return hero;
  },

  update: async (id, formData) => {
    const hero = await updateHero(id, formData);
    set({
      heroes: sortByOrder(get().heroes.map((h) => (h._id === id ? normalize(hero) : h))),
    });
    return hero;
  },

  remove: async (id) => {
    await deleteHero(id);
    set({ heroes: get().heroes.filter((h) => h._id !== id) });
  },

  reorder: async (items) => {
    const list = await reorderHeroes(items);
    set({ heroes: sortByOrder(normalizeAll(list)) });
  },
}));