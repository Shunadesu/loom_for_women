/**
 * Tabs phân loại diễn đàn
 * Props:
 *   - categories: mảng { id, label }
 *   - activeCategory: id category đang active
 *   - onCategoryChange: callback khi đổi category
 */
export default function ForumCategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}) {
  return (
    <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pb-1">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={[
              'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-all',
              isActive
                ? 'bg-[#E60067] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
