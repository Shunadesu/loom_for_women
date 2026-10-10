/**
 * Ghép base URL với relative path ảnh từ backend
 * @param {string} relativePath - e.g. "/uploads/heroes/abc.jpg"
 * @returns {string} - Full URL e.g. "https://sunnydemo.site/uploads/heroes/abc.jpg"
 */
export function resolveImageUrl(relativePath) {
  if (!relativePath) return '';
  
  // Nếu đã là full URL, return nguyên
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Nếu là relative path, ghép với base URL
  const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  return `${baseUrl}${relativePath}`;
}
