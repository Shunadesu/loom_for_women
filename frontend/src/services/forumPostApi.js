import api from './api.js';

/**
 * Lấy danh sách bài đã duyệt (approved)
 * @param {string} category - 'all' hoặc 'income-tips', 'scam-warning', 'learning-tips'
 */
export async function fetchForumPosts(category = 'all') {
  const params = {};
  if (category && category !== 'all') {
    params.category = category;
  }
  const { data } = await api.get('/forum-posts', { params });
  return data;
}

/**
 * Lấy chi tiết 1 bài
 */
export async function fetchForumPostById(id) {
  const { data } = await api.get(`/forum-posts/${id}`);
  return data;
}

/**
 * Đăng bài mới (require auth)
 */
export async function createForumPost(postData) {
  const { data } = await api.post('/forum-posts', postData);
  return data;
}

/**
 * Like/unlike bài (require auth)
 */
export async function likeForumPost(postId) {
  const { data } = await api.post(`/forum-posts/${postId}/like`);
  return data;
}

// ===== Admin APIs =====

/**
 * Lấy tất cả bài (admin)
 * @param {string} status - 'pending', 'approved', 'rejected', hoặc undefined (all)
 */
export async function fetchForumPostsAdmin(status) {
  const params = {};
  if (status) {
    params.status = status;
  }
  const { data } = await api.get('/admin/forum-posts', { params });
  return data;
}

/**
 * Duyệt bài (admin)
 */
export async function approveForumPost(postId) {
  const { data } = await api.patch(`/admin/forum-posts/${postId}/approve`);
  return data;
}

/**
 * Từ chối bài (admin)
 */
export async function rejectForumPost(postId) {
  const { data } = await api.patch(`/admin/forum-posts/${postId}/reject`);
  return data;
}

/**
 * Đánh dấu chất lượng + nhập voucher (admin)
 */
export async function markQualityPost(postId, isQuality, voucherCode = null) {
  const { data } = await api.patch(`/admin/forum-posts/${postId}/quality`, {
    isQuality,
    voucherCode,
  });
  return data;
}

/**
 * Xóa bài (admin)
 */
export async function deleteForumPost(postId) {
  const { data } = await api.delete(`/admin/forum-posts/${postId}`);
  return data;
}
