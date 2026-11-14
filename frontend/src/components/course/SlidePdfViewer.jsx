/**
 * Trình xem PDF slide (Phần 1 — Cung cấp kiến thức).
 *
 * Bọc core dùng chung `PdfSlideViewer` với header riêng của Phần 1.
 * Logic render trang PDF (lật trang, zoom, thumbnail) nằm trong
 * `PdfSlideViewer.jsx` — dùng chung với Phần 3 (PDF infographic tóm tắt).
 *
 * Props:
 * - pdfUrl      : URL file PDF slide (đã resolve thành URL tuyệt đối)
 * - pdfTitle    : tên hiển thị của file PDF
 * - lessonTitle : tiêu đề bài học (hiển thị trên header)
 */
import PdfSlideViewer from './PdfSlideViewer.jsx';

export default function SlidePdfViewer({
  pdfUrl = '',
  pdfTitle = '',
  lessonTitle = '',
}) {
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
      <PdfSlideViewer pdfUrl={pdfUrl} pdfTitle={pdfTitle} />
    </div>
  );
}
