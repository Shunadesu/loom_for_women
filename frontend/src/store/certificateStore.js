import { create } from 'zustand';
import { fetchMyCertificates } from '../services/certificateApi.js';

export const useCertificateStore = create((set) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchMyCertificates();
      set({ items, loading: false });
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được chứng chỉ.',
        loading: false,
      });
    }
  },
}));