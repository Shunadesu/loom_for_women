import { create } from 'zustand';
import {
  fetchPassport,
  fetchMyProducts,
  fetchMyOrders,
  fetchMyMessages,
} from '../services/passportApi.js';

export const usePassportStore = create((set, get) => ({
  // State
  passport: null,
  myProducts: [],
  myOrders: [],
  myMessages: [],
  loading: false,
  error: null,

  // Actions
  loadPassport: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchPassport();
      set({ passport: data, loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi tải thông tin hộ chiếu';
      set({ error: message, loading: false });
      throw err;
    }
  },

  loadMyProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchMyProducts();
      set({ myProducts: data, loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi tải sản phẩm';
      set({ error: message, loading: false });
      throw err;
    }
  },

  loadMyOrders: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchMyOrders();
      set({ myOrders: data, loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi tải đơn hàng';
      set({ error: message, loading: false });
      throw err;
    }
  },

  loadMyMessages: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchMyMessages();
      set({ myMessages: data, loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi tải tin nhắn';
      set({ error: message, loading: false });
      throw err;
    }
  },

  clearPassport: () => {
    set({
      passport: null,
      myProducts: [],
      myOrders: [],
      myMessages: [],
      error: null,
    });
  },
}));
