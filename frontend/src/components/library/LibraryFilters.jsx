import { SearchIcon, ClockIcon, CheckCircleIcon } from '../icons/index.jsx';
import {
  FILE_TYPE_OPTIONS,
  PROGRESS_OPTIONS,
} from '../../store/documentStore.js';

export default function LibraryFilters({
  filters,
  counts,
  courseOptions,
  onChange,
  onSearch,
}) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <SearchIcon
          aria-hidden="true"
          className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
        />
        <input
          type="text"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch();
          }}
          placeholder="Tìm tên tài liệu, khóa học..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#E60067] shadow-2xs"
        />
      </div>

      {/* Progress chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {PROGRESS_OPTIONS.map((opt) => {
          const active = filters.progress === opt.value;
          const count = counts?.[opt.value] ?? 0;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ progress: opt.value })}
              className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 transition-all flex items-center gap-1 ${
                active
                  ? 'bg-[#E60067] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {opt.value === 'ongoing' && (
                <ClockIcon aria-hidden="true" className="w-3 h-3 text-pink-400" />
              )}
              {opt.value === 'completed' && (
                <CheckCircleIcon
                  aria-hidden="true"
                  className="w-3 h-3 text-emerald-500"
                />
              )}
              <span>
                {opt.label} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Course chip filter (nếu có nhiều khóa) */}
      {courseOptions.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onChange({ courseId: '' })}
            className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 transition-all ${
              !filters.courseId
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả khóa
          </button>
          {courseOptions.map((c) => {
            const active = filters.courseId === c._id;
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => onChange({ courseId: c._id })}
                className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 transition-all ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Format chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {FILE_TYPE_OPTIONS.map((opt) => {
          const active =
            (filters.format || '') === opt.value;
          const base = 'px-2.5 py-1 rounded-lg text-[10px] font-semibold shrink-0 transition-colors ';
          const colorMap = {
            pdf: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
            excel: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
            infographic: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
            guide: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
          };
          return (
            <button
              key={opt.value || 'all'}
              type="button"
              onClick={() => onChange({ format: opt.value })}
              className={
                active
                  ? base + 'bg-slate-800 text-white'
                  : base + (colorMap[opt.value] || 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50')
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}