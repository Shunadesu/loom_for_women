/**
 * Trích xuất YouTube video ID từ nhiều dạng URL khác nhau.
 * Hỗ trợ:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://m.youtube.com/watch?v=ID
 *   - ID trực tiếp (11 ký tự)
 *
 * Trả về ID hoặc null nếu không parse được.
 */
export function extractYoutubeId(input) {
  if (!input) return null;
  const s = String(input).trim();

  // Nếu đã là 11 ký tự → khả năng cao là ID
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;

  // Thử parse URL
  let url;
  try {
    url = new URL(s);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');

  // youtu.be/<id>
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }

  // youtube.com
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    // /watch?v=<id>
    const v = url.searchParams.get('v');
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;

    // /embed/<id>, /shorts/<id>, /live/<id>
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => ['embed', 'shorts', 'live', 'v'].includes(p));
    if (idx >= 0 && parts[idx + 1] && /^[A-Za-z0-9_-]{11}$/.test(parts[idx + 1])) {
      return parts[idx + 1];
    }
  }

  return null;
}
