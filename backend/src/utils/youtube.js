/**
 * Extract YouTube ID từ URL đầy đủ hoặc ID raw.
 * Hỗ trợ:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/shorts/ID
 *   - ID (11 ký tự)
 */
const YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function extractYoutubeId(input) {
  if (!input) return null;
  const raw = String(input).trim();

  // Thử parse URL
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    // youtu.be/ID
    if (u.hostname.includes('youtu.be')) {
      const seg = u.pathname.split('/').filter(Boolean)[0];
      return seg && YT_ID_RE.test(seg) ? seg : null;
    }
    // youtube.com
    if (u.hostname.includes('youtube.com')) {
      // /watch?v=ID
      const v = u.searchParams.get('v');
      if (v && YT_ID_RE.test(v)) return v;
      // /embed/ID hoặc /shorts/ID
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex((p) => p === 'embed' || p === 'shorts');
      if (idx >= 0 && parts[idx + 1] && YT_ID_RE.test(parts[idx + 1])) {
        return parts[idx + 1];
      }
    }
  } catch {
    // không phải URL — bỏ qua
  }

  // Thử là ID raw
  if (YT_ID_RE.test(raw)) return raw;

  return null;
}

export function youtubeEmbedUrl(id) {
  return id ? `https://www.youtube.com/embed/${id}` : '';
}

export function youtubeThumbnailUrl(id, quality = 'hqdefault') {
  // hqdefault, mqdefault, sddefault, maxresdefault
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : '';
}