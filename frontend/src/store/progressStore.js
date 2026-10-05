import { create } from 'zustand';
import { fetchMyProgress, markLessonComplete } from '../services/progressApi.js';

export const useProgressStore = create((set, get) => ({
  // Map: courseId -> { progressPct, lastLessonId, completedLessons[] }
  byCourse: {},
  favoriteIds: new Set(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchMyProgress();
      const map = {};
      for (const p of data.items || []) {
        if (p.courseId) {
          map[String(p.courseId._id || p.courseId)] = {
            progressPct: p.progressPct,
            lastLessonId: p.lastLessonId ? String(p.lastLessonId) : null,
            completedLessons: (p.completedLessons || []).map((l) => String(l)),
          };
        }
      }
      set({
        byCourse: map,
        favoriteIds: new Set((data.favoriteCourseIds || []).map(String)),
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được tiến độ.',
        loading: false,
      });
    }
  },

  complete: async (lessonId, courseId) => {
    try {
      const res = await markLessonComplete(lessonId);
      // Cập nhật local
      const map = { ...get().byCourse };
      const cid = String(courseId);
      map[cid] = {
        ...(map[cid] || {}),
        progressPct: res.progressPct,
        lastLessonId: String(lessonId),
        completedCount: res.completedCount,
        totalLessons: res.totalLessons,
      };
      set({ byCourse: map });
      return res;
    } catch (err) {
      throw err;
    }
  },

  isFavorite: (courseId) => get().favoriteIds.has(String(courseId)),
  toggleFavoriteLocal: (courseId) => {
    const set1 = new Set(get().favoriteIds);
    const cid = String(courseId);
    if (set1.has(cid)) set1.delete(cid);
    else set1.add(cid);
    set({ favoriteIds: set1 });
  },
}));