import { extractYoutubeId } from './youtube.js';

/**
 * Tiện ích nhận diện nguồn video cho bài học: YouTube hoặc Google Drive.
 *
 * Google Drive hỗ trợ các dạng link:
 *   - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://drive.google.com/uc?id=FILE_ID&export=download
 *   - https://docs.google.com/uc?id=FILE_ID
 */

/** Trích xuất Google Drive file id từ URL (hoặc trả về chính input nếu là id hợp lệ). */
export function extractDriveFileId(input) {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  const DRIVE_ID_RE = /^[A-Za-z0-9_-]{10,}$/;

  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const host = u.hostname.toLowerCase();

    if (host.includes('drive.google.com') || host.includes('docs.google.com')) {
      // /file/d/FILE_ID/view
      const parts = u.pathname.split('/').filter(Boolean);
      const fileIdx = parts.indexOf('file');
      if (fileIdx >= 0 && parts[fileIdx + 1] === 'd' && parts[fileIdx + 2]) {
        return parts[fileIdx + 2];
      }
      // /d/FILE_ID
      const dIdx = parts.indexOf('d');
      if (dIdx >= 0 && parts[dIdx + 1]) return parts[dIdx + 1];

      // ?id=FILE_ID
      const id = u.searchParams.get('id');
      if (id) return id;
    }
  } catch {
    // không phải URL — bỏ qua
  }

  // ID thô
  if (DRIVE_ID_RE.test(raw)) return raw;

  return null;
}

/**
 * Xác định nguồn video từ 1 chuỗi (URL hoặc ID).
 * @returns {{provider: 'youtube'|'drive'|'' , youtubeId: string, driveFileId: string}}
 */
export function resolveVideoSource(input) {
  const empty = { provider: '', youtubeId: '', driveFileId: '' };
  if (!input) return empty;
  const raw = String(input).trim();
  if (!raw) return empty;

  // Ưu tiên nhận diện Drive trước nếu link nằm trong domain Drive
  if (/drive\.google\.com|docs\.google\.com/i.test(raw)) {
    const driveFileId = extractDriveFileId(raw);
    if (driveFileId) {
      return { provider: 'drive', youtubeId: '', driveFileId };
    }
  }

  const ytId = extractYoutubeId(raw);
  if (ytId) {
    return { provider: 'youtube', youtubeId: ytId, driveFileId: '' };
  }

  const driveFileId = extractDriveFileId(raw);
  if (driveFileId) {
    return { provider: 'drive', youtubeId: '', driveFileId };
  }

  return empty;
}

/** URL embed để nhúng video lên trang web. */
export function buildVideoEmbedUrl({
  videoProvider,
  youtubeId,
  driveFileId,
} = {}) {
  // Bài học cũ chỉ có youtubeId, chưa có videoProvider → coi như YouTube
  if (videoProvider === 'drive' && driveFileId) {
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
  }
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?rel=0`;
  }
  if (driveFileId) {
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
  }
  return '';
}

/** Nhãn tiếng Việt của provider, dùng cho UI. */
export const VIDEO_PROVIDER_LABEL = {
  youtube: 'YouTube',
  drive: 'Google Drive',
  '': '—',
};
