import { create } from 'zustand';
import {
  fetchCourses,
  fetchCourseBySlug,
} from '../services/courseApi.js';

const sortByOrder = (arr) =>
  [...arr].sort(
    (a, b) =>
      (a.order ?? 0) - (b.order ?? 0) ||
      (a.createdAt < b.createdAt ? -1 : 1)
  );

export const useCourseStore = create((set, get) => ({
  courses: [],
  loading: false,
  error: null,

  // Course detail (slug -> {course, myProgress})
  detailCache: {},
  detailLoading: false,
  detailError: null,

  list: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const items = await fetchCourses(params);
      set({ courses: sortByOrder(items), loading: false });
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được khóa học.',
        loading: false,
      });
    }
  },

  fetchDetail: async (slug) => {
    set({ detailLoading: true, detailError: null });
    try {
      const data = await fetchCourseBySlug(slug);
      set({
        detailCache: { ...get().detailCache, [slug]: data },
        detailLoading: false,
      });
      return data;
    } catch (err) {
      set({
        detailError:
          err?.response?.data?.error || 'Không tải được chi tiết khóa học.',
        detailLoading: false,
      });
      throw err;
    }
  },

  /** Cập nhật progressPct / isFavorite của 1 course trong list (sau khi tick). */
  patchCourseProgress: (courseId, patch) => {
    set({
      courses: get().courses.map((c) =>
        String(c._id) === String(courseId) ? { ...c, ...patch } : c
      ),
    });
  },
}));