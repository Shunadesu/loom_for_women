/**
 * Trích xuất YouTube video ID từ URL hoặc trả về ID nếu đã là ID.
 * Hỗ trợ:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - VIDEO_ID (11 ký tự)
 */
export function extractYoutubeId(input) {
  if (!input) return null;
  const str = String(input).trim();
  
  // Nếu đã là ID (11 ký tự chữ+số+_-)
  if (/^[A-Za-z0-9_-]{11}$/.test(str)) {
    return str;
  }
  
  // Pattern cho youtube.com
  const longMatch = str.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (longMatch) return longMatch[1];
  
  // Pattern cho youtu.be
  const shortMatch = str.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  
  return null;
}
