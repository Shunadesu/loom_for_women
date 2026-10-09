/**
 * Helpers để build / chuẩn hoá public URL cho resource upload (ảnh, document…).
 *
 * Backend nên set PUBLIC_BASE_URL=https://sunnydemo.site trong .env
 * để mọi URL upload lưu đúng domain, không bị localhost.
 *
 * Phía frontend dùng VITE_PUBLIC_BASE_URL + toRelativeImageUrl() để rewrite
 * localhost → domain production (đề phòng record cũ còn lưu localhost).
 */

/** Lấy base URL từ env. */
const getBase = () =>
  (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3010}`)
    .replace(/\/$/, '');

/** Build URL tuyệt đối: base + đường dẫn tương đối. */
export const buildPublicUrl = (subPath) => {
  if (!subPath) return subPath;
  if (/^https?:\/\//i.test(subPath)) return subPath;
  return `${getBase()}/${String(subPath).replace(/^\/+/, '')}`;
};

/**
 * Chuẩn hoá một URL ảnh:
 * - Nếu là localhost/127.0.0.1 → rewrite sang PUBLIC_BASE_URL.
 * - Nếu đã là https://... → giữ nguyên.
 * - Relative path → buildPublicUrl.
 */
export const absolutizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (
        u.hostname === 'localhost' ||
        u.hostname === '127.0.0.1' ||
        u.hostname === '0.0.0.0'
      ) {
        const base = new URL(getBase());
        u.protocol = base.protocol;
        u.host = base.host;
        return u.toString();
      }
      return url;
    } catch {
      return url;
    }
  }

  if (url.startsWith('/') || /^uploads\//i.test(url)) {
    return buildPublicUrl(url);
  }

  return url;
};
