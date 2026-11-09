import { useMemo } from 'react';
import { resolveImageUrl } from '../../utils/imageUrl.js';
import { extractYoutubeId } from '../../utils/youtube.js';

/**
 * Phần 3 — Tóm tắt bài học.
 *
 * format:
 *   - 'pdf_video' : PDF infographic + video tóm tắt
 *   - 'pdf'       : chỉ PDF infographic
 *   - 'video'     : chỉ video tóm tắt
 *
 * Props:
 * - summary : object { format, imageUrl, pdfUrl, pdfName, videoUrl, title }
 */
export default function SummaryStep({ summary }) {
  const s = summary || null;

  const videoId = useMemo(
    () => s?.youtubeId || extractYoutubeId(s?.videoUrl) || '',
    [s?.youtubeId, s?.videoUrl]
  );
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0`
    : s?.videoUrl || '';

  const format = s?.format || 'pdf_video';
  const showImage = format === 'pdf_video' || format === 'pdf';
  const showVideo = format === 'pdf_video' || format === 'video';

  if (!s || (!s.imageUrl && !s.pdfUrl && !s.videoUrl)) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="text-xs font-bold text-slate-700">
          Bài học này chưa có nội dung tóm tắt.
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Học viên vẫn có thể xem các nội dung khác của bài học.
        </p>
      </div>
    );
  }

  const label =
    format === 'pdf' ? 'Chỉ PDF Infographic' : format === 'video' ? 'Chỉ Video Tóm Tắt' : 'PDF Infographic + Video';

  return (
    <div className="space-y-4">
      {/* Header phần 3 */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-bold text-white shadow-sm">
            3
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
              Phần 3 • Tóm tắt bài học
            </span>
            <h3 className="mt-0.5 text-sm font-black text-slate-900">
              {s.title || 'Infographic tổng kết bài học'}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Định dạng hiển thị: {label}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ảnh / PDF infographic */}
        {showImage && (
          <div className="space-y-3">
            {s.imageUrl && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <img
                  src={resolveImageUrl(s.imageUrl)}
                  alt={s.title || 'Infographic tóm tắt'}
                  className="w-full rounded-xl object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            {s.pdfUrl && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                  <span className="truncate text-[11px] font-bold text-slate-700">
                    {s.pdfName || 'Tài liệu PDF tóm tắt'}
                  </span>
                  <a
                    href={resolveImageUrl(s.pdfUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-slate-900"
                  >
                    Tải PDF
                  </a>
                </div>
                <iframe
                  src={resolveImageUrl(s.pdfUrl)}
                  title={s.pdfName || 'PDF tóm tắt'}
                  className="h-[320px] w-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Video tóm tắt */}
        {showVideo && (
          <div className="space-y-3">
            {embedUrl ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
                <div className="aspect-video w-full">
                  <iframe
                    src={embedUrl}
                    title="Video tóm tắt bài học"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                Chưa có video tóm tắt cho phần này
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
