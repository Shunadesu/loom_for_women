import { lazy, Suspense, useMemo } from 'react';
import { resolveImageUrl } from '../../utils/imageUrl.js';
import { extractYoutubeId } from '../../utils/youtube.js';

// pdf.js (react-pdf) khá nặng (~1.4MB) → chỉ tải khi thực sự cần xem PDF.
const PdfSlideViewer = lazy(() => import('./PdfSlideViewer.jsx'));

/**
 * Phần 3 — Tóm tắt bài học.
 *
 * format:
 *   - 'pdf_video' : PDF infographic + video tóm tắt
 *   - 'pdf'       : chỉ PDF infographic
 *   - 'video'     : chỉ video tóm tắt
 *
 * File PDF được hiển thị bằng trình xem slide (react-pdf) giống hệt Phần 1 —
 * lật trang, zoom, thumbnail — thay vì nhúng <iframe> (bị trình duyệt chặn).
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

  const pdfUrl = s.pdfUrl ? resolveImageUrl(s.pdfUrl) : '';

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
        {pdfUrl && (
          <a
            href={pdfUrl}
            download
            className="flex shrink-0 items-center gap-1.5 self-end rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-100 sm:self-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-slate-500"
              aria-hidden="true"
            >
              <path d="M12 15V3" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m7 10 5 5 5-5" />
            </svg>
            <span>Tải PDF</span>
          </a>
        )}
      </div>

      {/* PDF infographic — hiển thị dạng slide giống Phần 1 */}
      {showImage && pdfUrl && (
        <Suspense
          fallback={
            <p className="py-16 text-center text-xs font-bold text-slate-500">
              Đang tải trình xem PDF...
            </p>
          }
        >
          <PdfSlideViewer pdfUrl={pdfUrl} pdfTitle={s.pdfName || ''} />
        </Suspense>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ảnh infographic (poster) */}
        {showImage && s.imageUrl && (
          <div className="space-y-3">
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
