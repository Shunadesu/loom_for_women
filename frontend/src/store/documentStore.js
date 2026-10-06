import { create } from 'zustand';
import {
  fetchDocuments,
  fetchCoursesWithDocuments,
  recordDownload,
} from '../services/documentApi.js';

export const FILE_TYPE_LABELS = {
  pdf: 'PDF',
  excel: 'EXCEL',
  infographic: 'INFOGRAPHIC',
  guide: 'HƯỚNG DẪN',
};

export const FILE_TYPE_OPTIONS = [
  { value: '', label: 'Định dạng: Tất cả' },
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'EXCEL' },
  { value: 'infographic', label: 'INFOGRAPHIC' },
  { value: 'guide', label: 'HƯỚNG DẪN' },
];

export const PROGRESS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'ongoing', label: 'Đang học' },
  { value: 'completed', label: 'Đã hoàn thành' },
];

export const useDocumentStore = create((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  error: null,

  filters: {
    q: '',
    courseId: '',
    format: '',
    progress: 'all',
  },

  courseOptions: [],

  setFilter: (patch) =>
    set((state) => ({
      filters: { ...state.filters, ...patch },
    })),

  fetchCourses: async () => {
    try {
      const items = await fetchCoursesWithDocuments();
      set({ courseOptions: items });
    } catch {
      set({ courseOptions: [] });
    }
  },

  fetchDocuments: async () => {
    set({ loading: true, error: null });
    const { filters } = get();
    const params = {
      q: filters.q || undefined,
      courseId: filters.courseId || undefined,
      format: filters.format || undefined,
      progress: filters.progress || undefined,
    };
    try {
      const data = await fetchDocuments(params);
      set({
        items: data.items || [],
        total: data.total || 0,
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được thư viện.',
        loading: false,
        items: [],
      });
    }
  },

  // Đếm nhanh cho chip "Tất cả (N) | Đang học (N) | Hoàn thành (N)"
  fetchCounts: async () => {
    try {
      const [allRes] = await Promise.all([
        fetchDocuments({ limit: 100 }),
      ]);
      const all = allRes.total || 0;
      // Đếm ongoing/completed từ courseProgressPct trong items.
      // Nếu user chưa login thì courseProgressPct = null → không tính.
      const items = allRes.items || [];
      let ongoing = 0;
      let completed = 0;
      for (const it of items) {
        const p = it.courseProgressPct;
        if (p == null) continue;
        if (p >= 100) completed += 1;
        else if (p > 0) ongoing += 1;
      }
      set({ counts: { all, ongoing, completed } });
    } catch {
      set({ counts: { all: 0, ongoing: 0, completed: 0 } });
    }
  },

  counts: { all: 0, ongoing: 0, completed: 0 },

  triggerDownload: async (id) => {
    try {
      return await recordDownload(id);
    } catch (err) {
      console.warn('recordDownload fail', err);
      return null;
    }
  },
}));