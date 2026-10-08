import { create } from 'zustand';
import {
  fetchConsignmentProducts,
  fetchMyConsignmentProducts,
  createConsignmentProduct,
} from '../services/consignmentApi.js';
import {
  MOCK_CONSIGNMENT_PRODUCTS,
  MOCK_MY_CONSIGNMENT_PRODUCTS,
} from '../data/mockConsignmentProducts.js';

const sortByOrder = (arr) =>
  [...arr].sort(
    (a, b) =>
      (a.order ?? 0) - (b.order ?? 0) ||
      (a.createdAt < b.createdAt ? 1 : -1)
  );

export const useConsignmentStore = create((set, get) => ({
  products: [],
  myProducts: [],
  loading: false,
  error: null,

  // List approved consignment products (public)
  list: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const items = await fetchConsignmentProducts(params);
      set({
        products: sortByOrder(Array.isArray(items) ? items : []),
        loading: false,
      });
    } catch (err) {
      // Fallback mock data
      set({
        products: sortByOrder(MOCK_CONSIGNMENT_PRODUCTS),
        error:
          err?.response?.data?.error ||
          'Backend chưa kết nối — đang hiển thị dữ liệu mẫu.',
        loading: false,
      });
    }
  },

  // List my consignment products (auth required)
  listMy: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchMyConsignmentProducts();
      set({
        myProducts: sortByOrder(Array.isArray(items) ? items : []),
        loading: false,
      });
    } catch (err) {
      // Fallback mock data
      set({
        myProducts: sortByOrder(MOCK_MY_CONSIGNMENT_PRODUCTS),
        error:
          err?.response?.data?.error ||
          'Backend chưa kết nối — đang hiển thị dữ liệu mẫu.',
        loading: false,
      });
    }
  },

  // Create new consignment product
  create: async (productData) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await createConsignmentProduct(productData);
      
      // Add to myProducts
      set((state) => ({
        myProducts: [newProduct, ...state.myProducts],
        loading: false,
      }));
      
      return newProduct;
    } catch (err) {
      set({
        error:
          err?.response?.data?.error ||
          'Không thể tạo sản phẩm ký gửi.',
        loading: false,
      });
      throw err;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
