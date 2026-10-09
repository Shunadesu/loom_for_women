import api from './api.js';

/**
 * Lấy danh sách người dùng kèm tóm tắt hoạt động (điểm, tier, số khóa đang học/hoàn thành, chứng chỉ).
 * Backend: GET /api/admin/users/summary
 * @param {{ search?: string, page?: number, limit?: number, role?: 'user'|'admin', isActive?: boolean|string }} params
 */
export const fetchUsersAdminSummary = async (params = {}) => {
  const { search = '', page = 1, limit = 20, role = '', isActive } = params;
  const query = { page, limit };
  if (search.trim()) query.search = search.trim();
  if (role) query.role = role;
  if (isActive === true || isActive === 'true') query.isActive = true;
  else if (isActive === false || isActive === 'false') query.isActive = false;

  const { data } = await api.get('/admin/users/summary', { params: query });
  return {
    items: data.items || [],
    page: data.page || 1,
    limit: data.limit || limit,
    total: data.total || 0,
    totalPages: data.totalPages || 1,
  };
};

/**
 * Lấy chi tiết 1 user + summary aggregate.
 * Backend: GET /api/admin/users/:id
 * @param {string} id
 */
export const getUserAdmin = async (id) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return { user: data.user, summary: data.summary || null };
};

/**
 * Xoá người dùng (không tự xoá chính mình — backend đã chặn).
 * Backend: DELETE /api/admin/users/:id
 * @param {string} id
 */
export const deleteUserAdmin = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};
