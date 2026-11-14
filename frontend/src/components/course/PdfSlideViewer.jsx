/**
 * Trình xem PDF dạng slide — core dùng chung.
 *
 * Dùng pdf.js (react-pdf) để nhúng trực tiếp file PDF: lật trang, zoom,
 * thumbnail và điều hướng. Được dùng ở:
 *   - Phần 1 (SlidePdfViewer) — slide bài giảng
 *   - Phần 3 (SummaryStep)    — PDF infographic tóm tắt
 *
 * Component này KHÔNG render header (do phần gọi quyết định) để tái sử dụng
 * được cho nhiều ngữ cảnh.
 *
 * Props:
 * - pdfUrl        : URL file PDF (đã resolve thành URL tuyệt đối)
 * - pdfTitle      : tên hiển thị của file PDF
 * - showThumbs    : mặc định có hiện cột thumbnail hay không
 * - heightRatio   : tỉ lệ chiều cao cửa sổ dành cho khung xem trang
 * - emptyHint     : nội dung khi không có file PDF
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Document, Page, Thumbnail, pdfjs } from 'react-pdf';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker của pdf.js — Vite cần import bằng `?url` để lấy đường dẫn file.
// Phải gán sau khi react-pdf được import (react-pdf tự set workerSrc mặc định).
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

// Padding của khung chứa thumbnail (p-2 = 8px mỗi cạnh).
const THUMB_PANE_PADDING_X = 16;
// Padding + viền của thẻ thumbnail (p-1 = 4px mỗi cạnh, viền 1px).
const THUMB_CARD_CHROME_X = 10;
// Khoảng trống an toàn (px) giữa trang PDF và mép khung.
const PAGE_FIT_MARGIN = 4;
// Padding (p-3 = 12px) + viền (1px) của khung xem trang PDF chính.
const MAIN_FRAME_CHROME_Y = 26;
// Tỉ lệ chiều cao cửa sổ dành cho khung xem trang PDF chính.
const MAIN_FRAME_HEIGHT_RATIO = 0.72;

/**
 * Đo kích thước (width/height) của một phần tử, tự cập nhật khi kích thước
 * thay đổi (resize cửa sổ, đổi layout…). Dùng để render trang PDF vừa khít
 * khung chứa nó, tránh bị cắt mất một phần như bản gốc.
 *
 * Trả về `[refCallback, size]`. Phải dùng callback ref thay vì object ref vì
 * phần tử đo có thể chưa tồn tại ở lần render đầu (react-pdf chỉ render
 * children sau khi PDF tải xong) — callback ref sẽ được gọi đúng lúc phần tử
 * xuất hiện và khiến việc đo kích thước chạy được.
 *
 * @returns {[[(el: HTMLElement|null) => void], {width:number, height:number}]}
 */
function useElementSize() {
  const [el, setEl] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!el) return undefined;

    const update = () => {
      setSize((prev) => {
        const width = el.clientWidth;
        const height = el.clientHeight;
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  // Callback ref: giữ nguyên identity để không re-render vô ích.
  const refCallback = useCallback((node) => setEl(node), []);

  return [refCallback, size];
}

export default function PdfSlideViewer({
  pdfUrl = '',
  pdfTitle = '',
  showThumbs: showThumbsProp = true,
  heightRatio = MAIN_FRAME_HEIGHT_RATIO,
  emptyHint = 'Học viên vẫn có thể xem các nội dung khác của bài học.',
}) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showThumbs, setShowThumbs] = useState(showThumbsProp);
  // Kích thước gốc của trang PDF hiện tại (đơn vị pt) — dùng để tính tỉ lệ vừa khung.
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  // Chiều cao khung nhìn hiện tại — dùng làm trần chiều cao cho trang PDF.
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === 'undefined' ? 900 : window.innerHeight
  );

  // Đo khung chứa thumbnail & khung chứa trang PDF chính để render vừa khít.
  const [thumbPaneRef, thumbSize] = useElementSize();
  const [mainPaneRef, mainSize] = useElementSize();

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Bề rộng khung thumbnail = clientWidth - padding (8px×2) - viền (1px×2).
  // Bên trong mỗi thẻ còn padding (4px×2) + viền (1px×2) ⇒ bề rộng canvas.
  const thumbPaneWidth = Math.min(
    140,
    Math.max(64, thumbSize.width - THUMB_PANE_PADDING_X - THUMB_CARD_CHROME_X)
  );

  // Bề rộng khung xem trang PDF chính (đo trên phần tử con, đã trừ padding/viền).
  const mainAvailableWidth = Math.max(
    120,
    mainSize.width - PAGE_FIT_MARGIN * 2
  );

  // Chiều cao tối đa dành cho khung xem trang PDF (theo chiều cao cửa sổ).
  const mainMaxHeight = Math.round(viewportHeight * heightRatio);

  // Tỉ lệ hiển thị: trang PDF được co giãn theo BỀ RỘNG khung xem ⇒ trang luôn
  // chiếm đúng bề rộng khung (không bị nhỏ lại, không bị bỏ trống hai bên).
  // Chiều cao bám theo tỉ lệ gốc của trang; nếu trang cao hơn khung thì khung
  // cuộn dọc bên trong.
  const fitScale = useMemo(() => {
    if (!pageSize.width || !pageSize.height) return 0;
    return mainAvailableWidth / pageSize.width;
  }, [mainAvailableWidth, pageSize.width, pageSize.height]);

  // Tỉ lệ hiển thị thực tế = tỉ lệ vừa khung × mức zoom người dùng chọn.
  const displayScale = fitScale > 0 ? fitScale * scale : 1;

  // Chiều cao trang sau khi render (px).
  const renderedPageHeight = pageSize.height
    ? Math.round(pageSize.height * displayScale)
    : 0;

  // Chiều cao khung chứa trang PDF: bám sát chiều cao trang để trang luôn
  // "full" khung, có giới hạn trần theo chiều cao cửa sổ.
  const mainFrameHeight = renderedPageHeight
    ? Math.min(mainMaxHeight, renderedPageHeight + MAIN_FRAME_CHROME_Y)
    : mainMaxHeight;
  const mainInnerHeight = Math.max(
    120,
    mainFrameHeight - MAIN_FRAME_CHROME_Y
  );

  // Đổi file → về trang đầu & reset zoom
  useEffect(() => {
    setPage(1);
    setScale(1);
    setNumPages(0);
    setLoading(true);
    setError(null);
    setPageSize({ width: 0, height: 0 });
  }, [pdfUrl]);

  const onLoadSuccess = useCallback(({ numPages: total }) => {
    setNumPages(total || 0);
    setLoading(false);
    setError(null);
  }, []);

  const onLoadError = useCallback((err) => {
    console.error('PdfSlideViewer load error', err);
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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="text-xs font-bold text-slate-700">
          Chưa có file PDF để hiển thị.
        </p>
        <p className="mt-1 text-[11px] text-slate-500">{emptyHint}</p>
      </div>
    );
  }

  return (
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
            <span
              className="min-w-[42px] text-center text-[11px] font-bold text-slate-700"
              title="100% = trang vừa kín bề rộng khung xem"
            >
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
            Đang tải file PDF...
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
                title={pdfTitle || 'File PDF'}
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
              {/* Thumbnail — render trang PDF vừa khít bề rộng khung để không bị cắt */}
              {showThumbs && numPages > 0 && (
                <div
                  ref={thumbPaneRef}
                  className="max-h-[700px] shrink-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 lg:w-[168px]"
                >
                  <div className="space-y-2">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map(
                      (n) => (
                        <div
                          key={n}
                          role="button"
                          tabIndex={0}
                          onClick={() => go(n)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              go(n);
                            }
                          }}
                          title={`Xem trang ${n}`}
                          className={`mx-auto block cursor-pointer overflow-hidden rounded-lg border p-1 transition-all ${
                            n === page
                              ? 'border-[#E60067] bg-white shadow-sm ring-2 ring-[#E60067]/30'
                              : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm'
                          }`}
                          style={{ width: thumbPaneWidth + THUMB_CARD_CHROME_X }}
                        >
                          <div className="overflow-hidden rounded-md bg-white">
                            <Thumbnail
                              pageNumber={n}
                              width={thumbPaneWidth}
                              className="block"
                              onItemClick={() => go(n)}
                            />
                          </div>
                          <span
                            className={`mt-1 block text-center text-[10px] font-bold ${
                              n === page ? 'text-[#E60067]' : 'text-slate-500'
                            }`}
                          >
                            Trang {n}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Trang PDF chính — tự co giãn vừa khung, giữ nguyên tỉ lệ gốc */}
              <div className="min-w-0 flex-1">
                <div
                  className="flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-3"
                  style={{ height: `${mainFrameHeight}px` }}
                >
                  <div
                    ref={mainPaneRef}
                    className="flex min-w-0 w-full items-center justify-center overflow-auto"
                    style={{ height: `${mainInnerHeight}px` }}
                  >
                    <div className="mx-auto shrink-0">
                      <Page
                        pageNumber={page}
                        scale={displayScale}
                        renderTextLayer
                        renderAnnotationLayer
                        loading=""
                        onLoadSuccess={({ originalWidth, originalHeight }) =>
                          setPageSize({
                            width: originalWidth,
                            height: originalHeight,
                          })
                        }
                        className="overflow-hidden rounded-lg shadow-md"
                      />
                    </div>
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
  );
}
