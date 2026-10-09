/**
 * Chuẩn hoá URL ảnh trong frontend.
 *
 * Hành vi:
 * - URL tuyệt đối (http://..., https://...) → trả về path tương đối.
 * - URL tương đối (bắt đầu '/') → nếu VITE_PUBLIC_BASE_URL được set
 *   thì trả về URL tuyệt đối trỏ về backend deploy (vd. https://sunnydemo.site/uploads/...),
 *   ngược lại giữ nguyên để đi qua Vite proxy ở local dev.
 * - data: / blob: → giữ nguyên.
 *
 * Thiết lập ở production:
 *   VITE_API_URL=https://sunnydemo.site/api
 *   VITE_PUBLIC_BASE_URL=https://sunnydemo.site
 */
const PUBLIC_BASE_URL = (import.meta.env.VITE_PUBLIC_BASE_URL || '').replace(/\/$/, '');

export function toRelativeImageUrl(url) {
  if (!url) return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/')) {
    return PUBLIC_BASE_URL ? `${PUBLIC_BASE_URL}${url}` : url;
  }
  try {
    const u = new URL(url);
    const path = `${u.pathname}${u.search || ''}`;
    return PUBLIC_BASE_URL ? `${PUBLIC_BASE_URL}${path}` : path;
  } catch {
    return url;
  }
}
