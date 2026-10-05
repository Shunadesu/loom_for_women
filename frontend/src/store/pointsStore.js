import { create } from 'zustand';
import {
  fetchMyPoints,
  fetchMyTransactions,
} from '../services/pointsApi.js';

export const usePointsStore = create((set) => ({
  total: 0,
  transactions: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchMyPoints();
      set({ total: data.total || 0, loading: false });
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được điểm.',
        loading: false,
      });
    }
  },

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const transactions = await fetchMyTransactions();
      set({ transactions, loading: false });
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được lịch sử.',
        loading: false,
      });
    }
  },
}));