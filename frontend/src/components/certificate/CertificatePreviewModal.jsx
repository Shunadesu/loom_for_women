import { XMarkIcon, PdfIcon, TrophyIcon, CheckCircleIcon } from '../icons/index.jsx';

/**
 * Modal xem trước chứng chỉ — tái dùng đúng mẫu HTML đang sinh PDF
 * trong MyCertificates.handleDownload để bản xem trước khớp bản PDF.
 *
 * Props:
 *   - cert: object chứng chỉ (cần userId, courseId, issuedAt, serialNumber)
 *   - open: boolean
 *   - onClose: đóng modal
 *   - onDownload: (cert) => tải PDF
 *   - downloading: id chứng chỉ đang tải (để disable nút)
 */
export default function CertificatePreviewModal({
  cert,
  open,
  onClose,
  onDownload,
  downloading,
}) {
  if (!open || !cert) return null;

  const learnerName = cert.userId?.name || cert.userId?.phone || 'Người học';
  const courseTitle = cert.courseId?.title || 'Khóa học';
  const issuedDate = cert.issuedAt
    ? new Date(cert.issuedAt).toLocaleDateString('vi-VN')
    : '';
  const isDownloading = downloading === cert._id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#E60067] to-rose-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <CheckCircleIcon aria-hidden="true" className="h-5 w-5" />
            <div>
              <h3 className="text-sm font-extrabold leading-tight">
                Chứng chỉ hoàn thành
              </h3>
              <p className="text-[11px] text-pink-100">
                Bấm Tải PDF để lưu về máy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
          >
            <XMarkIcon aria-hidden="true" className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Preview — khớp mẫu HTML sinh PDF */}
        <div className="p-4">
          <div className="border-8 border-[#E60067] p-6 text-center sm:p-8">
            <h1 className="mb-2 text-xl font-black text-[#E60067] sm:text-2xl">
              CHỨNG CHỈ HOÀN THÀNH
            </h1>
            <p className="mb-4 text-xs text-slate-500">Trao tặng cho</p>
            <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
              {learnerName}
            </h2>
            <p className="mb-2 text-xs text-slate-500">
              Đã hoàn thành xuất sắc khóa học
            </p>
            <h3 className="mb-4 text-sm font-bold text-slate-900 sm:text-base">
              {courseTitle}
            </h3>
            <p className="mb-2 text-[11px] text-slate-400">
              Ngày hoàn thành: {issuedDate}
            </p>
            <p className="text-[10px] text-slate-300">
              Mã số: {cert.serialNumber}
            </p>
          </div>

          {/* Huy hiệu điểm thưởng */}
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
            <TrophyIcon aria-hidden="true" className="h-4 w-4" />
            <span>+200đ hoàn thành khóa học</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-slate-100 p-3 sm:p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => onDownload?.(cert)}
            disabled={isDownloading}
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#E60067] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#d0005a] disabled:opacity-50"
          >
            <PdfIcon aria-hidden="true" className="h-3 w-3" />
            {isDownloading ? 'Đang tải...' : 'Tải PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
