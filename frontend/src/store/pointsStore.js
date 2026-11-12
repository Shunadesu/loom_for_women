import { create } from 'zustand';
import {
  fetchMyPoints,
  fetchMyTransactions,
} from '../services/pointsApi.js';

function levelFromPoints(total) {
  const safe = Number(total) || 0;
  if (safe >= 2000) return 4;
  if (safe >= 500) return 3;
  if (safe >= 100) return 2;
  return 1;
}

export const usePointsStore = create((set) => ({
  total: 0,
  transactions: [],
  loading: true,
  txLoading: true,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchMyPoints();
      const total = Number(data.total) || 0;
      set({ total, loading: false });
      // Đồng bộ lên header (BrandBar đọc authStore.points).
      try {
        const { useAuthStore } = await import('./authStore.js');
        useAuthStore.setState({ points: total, level: levelFromPoints(total) });
      } catch (_) {}
      return total;
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được điểm.',
        loading: false,
      });
    }
  },

  fetchTransactions: async () => {
    set({ txLoading: true, error: null });
    try {
      const transactions = await fetchMyTransactions();
      set({ transactions, txLoading: false });
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được lịch sử.',
        txLoading: false,
      });
    }
  },
}));