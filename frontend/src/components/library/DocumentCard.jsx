import { useState } from 'react';
import {
  FileTextIcon,
  ImageIcon,
  BookmarkIcon,
  EyeIcon,
} from '../icons/index.jsx';
import { FILE_TYPE_LABELS } from '../../store/documentStore.js';

const TYPE_STYLE = {
  pdf: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: 'text-rose-600',
  },
  excel: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
  },
  infographic: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: 'text-purple-600',
  },
  guide: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'text-blue-600',
  },
};

function formatSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${Math.round(kb)} KB`;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1
    ).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return '';
  }
}

export default function DocumentCard({ doc, onPreview, onDownload }) {
  const [saved, setSaved] = useState(false);
  const style = TYPE_STYLE[doc.fileType] || TYPE_STYLE.guide;
  const pct = doc.courseProgressPct;
  const courseTitle = doc.courseId?.title || '';
  const lessonTitle = doc.lessonId?.title || '';
  const isCompleted = typeof pct === 'number' && pct >= 100;
  const isOngoing = typeof pct === 'number' && pct > 0 && pct < 100;

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-pink-300 transition-all group">
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-50">
        <div className="flex items-center gap-1.5 min-w-0">
          {courseTitle && (
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-pink-100 hover:text-[#E60067] px-2 py-0.5 rounded-md truncate transition-colors">
              📚 {courseTitle}
            </span>
          )}
          {lessonTitle && (
            <span className="text-[9px] font-medium text-slate-400 truncate hidden sm:inline">
              / {lessonTitle}
            </span>
          )}
        </div>
        {pct != null && (
          <span
            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-pink-50 text-[#E60067] border border-pink-200'
            }`}
          >
            {isCompleted ? (
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
                className="w-2.5 h-2.5 text-emerald-600"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            ) : (
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
                className="w-2.5 h-2.5 text-[#E60067]"
                aria-hidden="true"
              >
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            )}
            <span>
              {isCompleted ? 'Đã học (100%)' : `Đang học (${pct}%)`}
            </span>
          </span>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${style.bg} ${style.text} ${style.border}`}
        >
          {doc.fileType === 'infographic' ? (
            <ImageIcon aria-hidden="true" className={`w-4 h-4 ${style.icon}`} />
          ) : (
            <FileTextIcon aria-hidden="true" className={`w-4 h-4 ${style.icon}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}
            >
              {FILE_TYPE_LABELS[doc.fileType] || doc.fileType?.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {doc.fileSize ? formatSize(doc.fileSize) : ''}
              {doc.fileSize && doc.pageCount ? ' • ' : ''}
              {doc.pageCount ? `${doc.pageCount} trang` : ''}
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 mt-1 group-hover:text-[#E60067] transition-colors leading-snug">
            {doc.title}
          </h3>
          {doc.description && (
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {doc.description}
            </p>
          )}
          <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">
              ⬇️ {doc.downloadCount || 0} lượt tải
              {doc.createdAt ? ` • ${formatDate(doc.createdAt)}` : ''}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSaved((v) => !v)}
                className={`p-1.5 rounded-lg border transition-all ${
                  saved
                    ? 'bg-pink-50 text-[#E60067] border-pink-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                }`}
                title={saved ? 'Đã lưu tài liệu' : 'Lưu tài liệu'}
              >
                <BookmarkIcon
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => onPreview?.(doc)}
                className="bg-pink-50 hover:bg-pink-100 text-[#E60067] text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <EyeIcon aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Đọc ngay</span>
              </button>
              <button
                type="button"
                onClick={() => onDownload?.(doc)}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all bg-[#E60067] hover:bg-[#c90059] text-white shadow-xs"
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
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                >
                  <path d="M12 15V3" />
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5" />
                </svg>
                <span>Tải về</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}