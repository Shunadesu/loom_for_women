import { useEffect } from 'react';
import { useCategoryStore } from '../../store/categoryStore.js';
import { FolderIconSolid } from '../icons/index.jsx';

/**
 * Dải chip filter theo danh mục.
 * - Props:
 *    + active: categoryId hiện tại ('' = tất cả)
 *    + onChange(id): callback khi chọn
 */
export default function CategoryFilterChips({ active = '', onChange }) {
  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetch);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  if (categories.length === 0) return null;

  return (
    <div className="-mx-3.5 flex gap-1.5 overflow-x-auto px-3.5 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Chip
        label="Tất cả"
        color="#E60067"
        active={!active}
        onClick={() => onChange?.('')}
      />
      {categories.map((c) => (
        <Chip
          key={c._id}
          label={c.name}
          color={c.color || '#E60067'}
          active={active === c._id}
          onClick={() => onChange?.(c._id)}
        />
      ))}
    </div>
  );
}

function Chip({ label, color, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all',
        active
          ? 'text-white shadow-xs'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-pink-200 hover:bg-pink-50',
      ].join(' ')}
      style={active ? { backgroundColor: color } : undefined}
    >
      <FolderIconSolid aria-hidden="true" className="h-3 w-3" />
      {label}
    </button>
  );
}
