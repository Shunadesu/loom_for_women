import { useEffect, useRef } from 'react';
import { XIcon } from '../icons/index.jsx';
import { resolveImageUrl } from '../../utils/imageUrl.js';

export default function DocumentPreviewModal({ doc, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!doc) return null;

  const isImage =
    doc.fileType === 'infographic' ||
    /\.(jpe?g|png|webp|gif)$/i.test(doc.fileUrl);
  const isPdf = doc.fileType === 'pdf' || /\.pdf$/i.test(doc.fileUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      ref={dialogRef}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {doc.fileType?.toUpperCase()} • {doc.fileExt || ''}
            </p>
            <h3 className="text-sm font-extrabold text-slate-900 truncate">
              {doc.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0"
            aria-label="Đóng"
          >
            <XIcon aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 bg-slate-50 overflow-auto">
          {isImage ? (
            <img
              src={resolveImageUrl(doc.fileUrl)}
              alt={doc.title}
              className="w-full h-auto block mx-auto"
              loading="lazy"
            />
          ) : isPdf ? (
            <iframe
              title={doc.title}
              src={resolveImageUrl(doc.fileUrl)}
              className="w-full h-[70vh] border-0"
            />
          ) : (
            <div className="p-10 text-center text-sm text-slate-500">
              File này không hỗ trợ xem trực tiếp. Vui lòng bấm{' '}
              <a
                href={resolveImageUrl(doc.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="text-[#E60067] font-bold hover:underline"
              >
                tải về
              </a>{' '}
              để mở.
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <a
            href={resolveImageUrl(doc.fileUrl)}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E60067] hover:bg-[#c90059] text-white shadow-xs"
          >
            Tải về
          </a>
        </div>
      </div>
    </div>
  );
}