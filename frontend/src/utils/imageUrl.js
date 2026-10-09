/**
 * Chuẩn hoá URL ảnh trong frontend.
 *
 * Đơn giản hoá: nếu backend trả URL tuyệt đối (https://...), giữ nguyên.
 * Chỉ xử lý khi URL tương đối (bắt đầu '/') → prepend VITE_PUBLIC_BASE_URL.
 *
 * Backend đã set PUBLIC_BASE_URL=https://sunnydemo.site nên sẽ trả URL đầy đủ.
 * Frontend chỉ cần hiển thị, không cần rewrite.
 */
const PUBLIC_BASE_URL = (import.meta.env.VITE_PUBLIC_BASE_URL || '').replace(/\/$/, '');

export function toRelativeImageUrl(url) {
  if (!url) return url;
  
  // data: / blob: / URL tuyệt đối → giữ nguyên
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  // URL tương đối → prepend base nếu có
  if (url.startsWith('/')) {
    return PUBLIC_BASE_URL ? `${PUBLIC_BASE_URL}${url}` : url;
  }
  
  return url;
}
