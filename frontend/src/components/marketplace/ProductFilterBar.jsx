import { FilterIcon } from '../../components/icons/index.jsx';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'priceAsc', label: 'Giá tăng dần' },
  { value: 'priceDesc', label: 'Giá giảm dần' },
  { value: 'popular', label: 'Bán chạy' },
];

export default function ProductFilterBar({ sortBy, onSortChange }) {
  function handleFilterClick() {
    alert('Bộ lọc nâng cao sắp ra mắt.');
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2.5 shadow-xs">
      <button
        type="button"
        onClick={handleFilterClick}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
      >
        <FilterIcon aria-hidden="true" className="h-3.5 w-3.5" />
        Lọc
      </button>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Sắp xếp:
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-[#E60067] focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}