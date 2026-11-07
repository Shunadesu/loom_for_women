/**
 * Tiện ích tracking lượt truy cập.
 */

const VISITOR_ID_KEY = 'loom-visitor-id';

/**
 * Lấy (hoặc tạo) visitorId duy nhất cho trình duyệt.
 * Dùng để đếm "người dùng duy nhất" thay vì "lượt truy cập".
 */
export function getVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    // localStorage bị chặn (private mode) — dùng id tạm thời
    return `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Map pathname → pageType.
 * - '/'                    → home
 * - '/khoa-hoc'            → course_list
 * - '/khoa-hoc/:slug'      → course_detail
 * - '/cua-hang'            → product
 * - còn lại                → other
 */
export function resolvePageType(pathname) {
  const p = String(pathname || '/');
  if (p === '/' || p === '') return 'home';
  if (p === '/khoa-hoc') return 'course_list';
  if (p.startsWith('/khoa-hoc/')) return 'course_detail';
  if (p === '/cua-hang' || p.startsWith('/cua-hang/')) return 'product';
  return 'other';
}
