import { create } from 'zustand';
import {
  fetchProducts,
  fetchProductBySlug,
  fetchProductCategories,
} from '../services/productApi.js';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockProducts.js';

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

  // Product detail
  detailCache: {},
  detailLoading: false,
  detailError: null,

  list: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const [items, cats] = await Promise.all([
        fetchProducts(params),
        get().categories.length > 0
          ? Promise.resolve(get().categories)
          : fetchProductCategories(),
      ]);
      set({
        products: sortByOrder(items),
        categories: cats,
        loading: false,
      });
    } catch (err) {
      // Backend lỗi / chưa có → fallback mock data
      set({
        products: sortByOrder(MOCK_PRODUCTS),
        categories: MOCK_CATEGORIES,
        error:
          err?.response?.data?.error ||
          'Backend chưa kết nối — đang hiển thị dữ liệu mẫu.',
        loading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const cats = await fetchProductCategories();
      set({ categories: cats });
    } catch {
      set({ categories: MOCK_CATEGORIES });
    }
  },

  fetchDetail: async (slug) => {
    set({ detailLoading: true, detailError: null });
    try {
      const data = await fetchProductBySlug(slug);
      set({
        detailCache: { ...get().detailCache, [slug]: data },
        detailLoading: false,
      });
      return data;
    } catch (err) {
      set({
        detailError:
          err?.response?.data?.error || 'Không tải được chi tiết sản phẩm.',
        detailLoading: false,
      });
      throw err;
    }
  },
}));