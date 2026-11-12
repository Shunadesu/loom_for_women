import { create } from 'zustand';
import {
  fetchMyProgress,
  markLessonComplete,
  fetchMyStats,
  fetchContinueLearning,
} from '../services/progressApi.js';

const DEFAULT_STATS = {
  ongoing: 0,
  completed: 0,
  totalMinutes: 0,
  certificatesCount: 0,
  favoriteCount: 0,
};

export const useProgressStore = create((set, get) => ({
  // Map: courseId -> { progressPct, lastLessonId, completedLessons[] }
  byCourse: {},
  favoriteIds: new Set(),
  loading: false,
  error: null,

  // Stats summary cho header
  stats: DEFAULT_STATS,
  statsLoading: false,

  // Continue learning (1 course gần nhất đang học dở)
  continueItem: null,
  continueLoading: false,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchMyProgress();
      const map = {};
      for (const p of data.items || []) {
        if (p.courseId) {
          const cid = String(p.courseId._id || p.courseId);
          const completed = new Set((p.completedLessons || []).map(String));
          // Gộp với dữ liệu local (bài vừa hoàn thành trong phiên hiện tại)
          // để không bị mất khi API trả về dữ liệu cũ.
          const local = get().byCourse[cid];
          for (const id of local?.completedLessons || []) completed.add(String(id));
          map[cid] = {
            progressPct: Math.max(
              Number(p.progressPct) || 0,
              Number(local?.progressPct) || 0
            ),
            lastLessonId: p.lastLessonId ? String(p.lastLessonId) : local?.lastLessonId || null,
            completedLessons: Array.from(completed),
            completedCount: completed.size,
            totalLessons: local?.totalLessons,
          };
        }
      }
      // Giữ lại các khóa chỉ có ở local (vừa học xong nhưng API chưa kịp trả),
      // tránh bị mất badge / % tiến trình khi refetch.
      for (const [cid, local] of Object.entries(get().byCourse)) {
        if (!map[cid] && local) map[cid] = local;
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

  fetchStats: async () => {
    set({ statsLoading: true });
    try {
      const data = await fetchMyStats();
      set({ stats: { ...DEFAULT_STATS, ...data }, statsLoading: false });
    } catch {
      set({ stats: DEFAULT_STATS, statsLoading: false });
    }
  },

  fetchContinue: async () => {
    set({ continueLoading: true });
    try {
      const data = await fetchContinueLearning();
      set({ continueItem: data?.item || null, continueLoading: false });
    } catch {
      set({ continueItem: null, continueLoading: false });
    }
  },

  complete: async (lessonId, courseId) => {
    try {
      const res = await markLessonComplete(lessonId);
      // Cập nhật local
      const map = { ...get().byCourse };
      const cid = String(courseId);
      const prev = map[cid] || {};
      // Thêm bài học vào danh sách đã hoàn thành (không trùng) để UI
      // "Đã hoàn thành" + thanh tiến trình cập nhật ngay.
      const completed = new Set((prev.completedLessons || []).map(String));
      completed.add(String(lessonId));
      map[cid] = {
        ...prev,
        progressPct: res.progressPct,
        lastLessonId: String(lessonId),
        completedLessons: Array.from(completed),
        completedCount: res.completedCount,
        totalLessons: res.totalLessons,
      };
      set({ byCourse: map });
      // Đồng bộ điểm mới lên header + trang điểm ngay khi hoàn thành.
      // Backend trả totalPoints (tổng từ PointTransaction) sau khi cộng
      // lesson_complete / course_finish (200đ).
      get().syncPoints(res?.totalPoints);
      return res;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Cập nhật tiến độ sau khi học viên trả lời đúng trắc nghiệm.
   * Backend đã tự tick hoàn thành bài học, ta chỉ cập nhật state local.
   * Đồng thời đồng bộ totalPoints (nếu có) để header nhảy điểm ngay.
   * Chỉ đánh dấu hoàn thành khi backend trả progressPct (tức đã đủ cả bài);
   * quiz đúng lẻ vẫn cộng điểm nhưng chưa tick hoàn thành.
   */
  applyQuizResult: (courseId, lessonId, result = {}) => {
    if (!courseId) return result;
    const finished = typeof result?.progressPct === 'number' || result?.allCorrect === true;
    const map = { ...get().byCourse };
    const cid = String(courseId);
    const lid = String(lessonId);
    const prev = map[cid] || {};
    if (finished) {
      const completed = new Set((prev.completedLessons || []).map(String));
      completed.add(lid);
      map[cid] = {
        ...prev,
        lastLessonId: lid,
        completedLessons: Array.from(completed),
        progressPct:
          typeof result.progressPct === 'number'
            ? result.progressPct
            : prev.progressPct,
      };
      set({ byCourse: map });
    }
    get().syncPoints(result?.totalPoints);
    return result;
  },

  /**
   * Đồng bộ tổng điểm mới lên header + trang điểm (dùng cho quiz đúng lẻ,
   * bình luận... — những chỗ cộng điểm nhưng chưa hoàn thành bài học).
   */
  syncPoints: (totalPoints) => {
    if (typeof totalPoints !== 'number') return;
    try {
      // Dynamic import đồng bộ để tránh circular import lúc khởi tạo store.
      import('./authStore.js')
        .then(({ useAuthStore }) => {
          const pts = Number(totalPoints) || 0;
          const level = pts >= 2000 ? 4 : pts >= 500 ? 3 : pts >= 100 ? 2 : 1;
          useAuthStore.setState({ points: pts, level });
        })
        .catch(() => {});
      import('./pointsStore.js')
        .then(({ usePointsStore }) => {
          usePointsStore.setState({ total: Number(totalPoints) || 0 });
        })
        .catch(() => {});
    } catch (_) {}
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