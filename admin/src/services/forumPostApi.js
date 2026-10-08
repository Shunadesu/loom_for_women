import api from './api.js';

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
