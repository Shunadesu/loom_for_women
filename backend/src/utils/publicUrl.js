/**
 * Helpers để build / chuẩn hoá public URL cho resource upload (ảnh, document…).
 *
 * Tại sao cần:
 * - Khi upload, controller build URL = ${PUBLIC_BASE_URL}/uploads/<file>.
 * - Nếu deploy quên set PUBLIC_BASE_URL, fallback về http://localhost:PORT
 *   làm record trong DB bị "khoá" vào localhost.
 * - Ở phía read, ta rewrite mọi URL localhost/127.0.0.1/relative → URL theo
 *   PUBLIC_BASE_URL hiện tại, nên response API luôn đúng domain dù record
 *   cũ vẫn lưu localhost.
 */

/** Lấy base URL hiện tại (đã strip trailing slash). */
export const getPublicBaseUrl = () =>
  (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3010}`)
    .replace(/\/$/, '');

/** Build URL tuyệt đối từ một đường dẫn tương đối ('uploads/heroes/x.jpg' hoặc '/uploads/...'). */
export const buildPublicUrl = (relativePath) => {
  if (!relativePath) return relativePath;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  const base = getPublicBaseUrl();
  return `${base}/${String(relativePath).replace(/^\/+/, '')}`;
};

/**
 * Chuẩn hoá một URL ảnh đã có sẵn:
 * - Nếu là URL localhost/127.0.0.1 → rewrite host sang PUBLIC_BASE_URL hiện tại.
 * - Nếu là URL relative (bắt đầu bằng '/') → build theo PUBLIC_BASE_URL.
 * - Nếu đã là absolute (https://...) → giữ nguyên.
 * - Nếu rỗng / null → trả về nguyên.
 */
export const absolutizeImageUrl = (url) => {
  if (!url) return url;
  if (typeof url !== 'string') return url;

  // Đã là absolute với scheme http/https
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      // Rewrite nếu đang trỏ về localhost / 127.0.0.1
      if (
        u.hostname === 'localhost' ||
        u.hostname === '127.0.0.1' ||
        u.hostname === '0.0.0.0'
      ) {
        const base = new URL(getPublicBaseUrl());
        u.protocol = base.protocol;
        u.host = base.host; // bao gồm port nếu có
        return u.toString();
      }
      return url;
    } catch {
      return url;
    }
  }

  // Relative ('/uploads/...' hoặc 'uploads/...')
  if (url.startsWith('/') || /^uploads\//i.test(url)) {
    return buildPublicUrl(url);
  }

  return url;
};
