import { useState, useRef, useEffect } from 'react';
import { SortIcon, CheckIcon, ChevronRightIcon } from '../icons/index.jsx';

const OPTIONS = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'popular', label: 'Phổ biến' },
  { id: 'shortest', label: 'Thời lượng ngắn' },
  { id: 'longest', label: 'Thời lượng dài' },
];

/**
 * Dropdown chọn cách sắp xếp course list.
 * - value: id hiện tại ('newest' | 'popular' | 'shortest' | 'longest')
 * - onChange(id)
 */
export default function CourseSortDropdown({ value = 'newest', onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const current = OPTIONS.find((o) => o.id === value) || OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:border-pink-200"
      >
        <span className="flex items-center gap-1.5">
          <SortIcon aria-hidden="true" className="h-3 w-3 text-slate-400" />
          Sắp xếp: <span className="text-[#E60067]">{current.label}</span>
        </span>
        <ChevronRightIcon
          aria-hidden="true"
          className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange?.(opt.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-pink-50"
            >
              <span>{opt.label}</span>
              {opt.id === value && (
                <CheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#E60067]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
