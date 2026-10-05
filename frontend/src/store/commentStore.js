import { create } from 'zustand';
import { fetchComments, postComment } from '../services/commentApi.js';

export const useCommentStore = create((set, get) => ({
  // Map: courseId -> [comments]
  byCourse: {},
  loading: false,
  posting: false,
  error: null,

  fetch: async (courseId) => {
    const cid = String(courseId);
    set({ loading: true, error: null });
    try {
      const items = await fetchComments(cid);
      set({
        byCourse: { ...get().byCourse, [cid]: items },
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.response?.data?.error || 'Không tải được bình luận.',
        loading: false,
      });
    }
  },

  post: async ({ courseId, content, rating, parentId }) => {
    set({ posting: true });
    try {
      const comment = await postComment({ courseId, content, rating, parentId });
      const cid = String(courseId);
      const list = get().byCourse[cid] || [];
      set({
        byCourse: { ...get().byCourse, [cid]: [comment, ...list] },
        posting: false,
      });
      return comment;
    } catch (err) {
      set({ posting: false });
      throw err;
    }
  },
}));