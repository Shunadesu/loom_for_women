/**
 * Trình xem PDF slide (Phần 1 — Cung cấp kiến thức).
 *
 * Dùng pdf.js (react-pdf) để nhúng trực tiếp file PDF slide vào trang bài học:
 * lật trang, zoom, thumbnail, tải về và mở tab mới.
 *
 * Props:
 * - pdfUrl      : URL file PDF slide (đã resolve thành URL tuyệt đối)
 * - pdfTitle    : tên hiển thị của file PDF
 * - lessonTitle : tiêu đề bài học (hiển thị trên header)
 */
import { useCallback, useEffect, useState } from 'react';
import { Document, Page, Thumbnail, pdfjs } from 'react-pdf';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker của pdf.js — Vite cần import bằng `?url` để lấy đường dẫn file.
// Phải gán sau khi react-pdf được import (react-pdf tự set workerSrc mặc định).
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;

export default function SlidePdfViewer({
  pdfUrl = '',
  pdfTitle = '',
  lessonTitle = '',
}) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showThumbs, setShowThumbs] = useState(true);

  // Đổi file → về trang đầu & reset zoom
  useEffect(() => {
    setPage(1);
    setScale(1);
    setNumPages(0);
    setLoading(true);
    setError(null);
  }, [pdfUrl]);

  const onLoadSuccess = useCallback(({ numPages: total }) => {
    setNumPages(total || 0);
    setLoading(false);
    setError(null);
  }, []);

  const onLoadError = useCallback((err) => {
    console.error('SlidePdfViewer load error', err);
    setLoading(false);
    setError(err?.message || 'Không đọc được file PDF.');
  }, []);

  const go = useCallback(
    (next) => {
      setPage(Math.min(Math.max(next, 1), Math.max(numPages, 1)));
    },
    [numPages]
  );

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(ZOOM_MAX, Number((s + ZOOM_STEP).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(ZOOM_MIN, Number((s - ZOOM_STEP).toFixed(2))));
  }, []);

  if (!pdfUrl) {
    return (
      <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/50 p-6 text-center">
        <p className="text-xs font-bold text-slate-700">
          Bài học này chưa có file PDF slide.
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Học viên vẫn có thể xem các nội dung khác của bài học.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bài học */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-pink-200 bg-pink-50 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E60067] text-sm font-bold text-white shadow-sm">
            1
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E60067]">
              Phần 1 • Cung cấp kiến thức
            </span>
            <h3 className="mt-0.5 text-sm font-black text-slate-900">
              Trình Chiếu Slide Bài Giảng: {pdfTitle || lessonTitle}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Chuyên đề: {lessonTitle || 'Khóa học'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <a
            href={pdfUrl}
            download
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-100"
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
            <span className="hidden sm:inline">Tải Slide</span>
            <span className="sm:hidden">Tải</span>
          </a>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-100"
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
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            <span className="hidden sm:inline">Mở tab mới</span>
            <span className="sm:hidden">Mở</span>
          </a>
        </div>
      </div>

      {/* Khung PDF */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm p-2">
        {/* Thanh công cụ */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded-lg bg-pink-100 px-2.5 py-1 text-xs font-extrabold text-[#E60067]">
              Trang {numPages > 0 ? page : '—'} / {numPages || '—'}
            </span>
            {pdfTitle && (
              <h4 className="max-w-xs truncate text-xs font-extrabold text-slate-900 sm:max-w-md">
                {pdfTitle}
              </h4>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= ZOOM_MIN}
                aria-label="Thu nhỏ"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                </svg>
              </button>
              <span className="min-w-[42px] text-center text-[11px] font-bold text-slate-700">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= ZOOM_MAX}
                aria-label="Phóng to"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowThumbs((v) => !v)}
              className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                showThumbs
                  ? 'border-pink-200 bg-pink-50 text-[#E60067]'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {showThumbs ? 'Ẩn trang nhỏ' : 'Hiện trang nhỏ'}
            </button>
          </div>
        </div>

        {/* Nội dung */}
        <div className="pt-3">
          {loading && (
            <p className="py-16 text-center text-xs font-bold text-slate-500">
              Đang tải file PDF slide...
            </p>
          )}

          {error && (
            <div className="space-y-2 py-8 text-center">
              <p className="text-xs font-bold text-red-600">{error}</p>
              <p className="text-[11px] text-slate-500">
                Trình duyệt không đọc được file PDF này. Bạn có thể tải về và mở
                bằng trình đọc PDF.
              </p>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white text-left">
                <iframe
                  title={pdfTitle || 'File PDF slide'}
                  src={pdfUrl}
                  className="h-[480px] w-full"
                />
              </div>
            </div>
          )}

          {!error && (
            <Document
              file={pdfUrl}
              onLoadSuccess={onLoadSuccess}
              onLoadError={onLoadError}
              loading=""
              error=""
            >
              <div className="flex flex-col gap-3 lg:flex-row">
                {/* Thumbnail */}
                {showThumbs && numPages > 0 && (
                  <div className="max-h-[520px] shrink-0 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 lg:w-[136px]">
                    <div className="space-y-2">
                      {Array.from({ length: numPages }, (_, i) => i + 1).map(
                        (n) => (
                          <div
                            key={n}
                            className={`rounded-lg border p-1 transition-all ${
                              n === page
                                ? 'border-[#E60067] bg-white shadow-xs ring-1 ring-[#E60067]/30'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <Thumbnail
                              pageNumber={n}
                              scale={0.24}
                              onItemClick={() => go(n)}
                            />
                            <span className="mt-0.5 block text-center text-[9px] font-bold text-slate-500">
                              Trang {n}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Trang PDF chính */}
                <div className="min-w-0 flex-1">
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-3">
                    <div className="overflow-auto">
                      <Page
                        pageNumber={page}
                        scale={scale}
                        renderTextLayer
                        renderAnnotationLayer
                        loading=""
                        className="mx-auto"
                      />
                    </div>
                  </div>

                  {/* Điều hướng */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => go(page - 1)}
                      disabled={page <= 1}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      <span>Trang trước</span>
                    </button>

                    <span className="text-[11px] font-bold text-slate-500">
                      {numPages > 0
                        ? `Trang ${page} / ${numPages}`
                        : 'Đang tải...'}
                    </span>

                    <button
                      type="button"
                      onClick={() => go(page + 1)}
                      disabled={numPages > 0 && page >= numPages}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#E60067] px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#c90059] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span>Trang sau</span>
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
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Document>
          )}
        </div>
      </div>
    </div>
  );
}
