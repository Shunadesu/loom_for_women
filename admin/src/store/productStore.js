import { create } from 'zustand';
import {
  fetchAllProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  reorderProductsAdmin,
  fetchAllProductCategoriesAdmin,
  createProductCategoryAdmin,
  updateProductCategoryAdmin,
  deleteProductCategoryAdmin,
  reorderProductCategoriesAdmin,
} from '../services/productApi.js';

const sortByOrder = (arr) =>
  [...arr].sort(
    (a, b) =>
      (a.order ?? 0) - (b.order ?? 0) ||
      (a.createdAt < b.createdAt ? -1 : 1)
  );

export const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchAllProductsAdmin();
      set({ products: sortByOrder(items), loading: false });
    } catch (err) {
      set({ error: err?.response?.data?.error || 'Lỗi tải sản phẩm.', loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const cats = await fetchAllProductCategoriesAdmin();
      set({ categories: cats });
    } catch (err) {
      set({ error: err?.response?.data?.error || 'Lỗi tải danh mục.' });
    }
  },

  create: async (formData) => {
    const product = await createProductAdmin(formData);
    set({ products: sortByOrder([product, ...get().products]) });
    return product;
  },

  update: async (id, formData) => {
    const product = await updateProductAdmin(id, formData);
    set({
      products: sortByOrder(get().products.map((p) => (p._id === id ? product : p))),
    });
    return product;
  },

  remove: async (id) => {
    await deleteProductAdmin(id);
    set({ products: get().products.filter((p) => p._id !== id) });
  },

  reorder: async (items) => {
    const list = await reorderProductsAdmin(items);
    set({ products: sortByOrder(list) });
  },

  createCategory: async (payload) => {
    const cat = await createProductCategoryAdmin(payload);
    set({ categories: [...get().categories, cat] });
    return cat;
  },

  updateCategory: async (id, payload) => {
    const cat = await updateProductCategoryAdmin(id, payload);
    set({
      categories: get().categories.map((c) => (c._id === id ? cat : c)),
    });
    return cat;
  },

  removeCategory: async (id) => {
    await deleteProductCategoryAdmin(id);
    set({ categories: get().categories.filter((c) => c._id !== id) });
  },

  reorderCategories: async (items) => {
    const list = await reorderProductCategoriesAdmin(items);
    set({ categories: list });
  },
}));