const ALL_CATEGORY = { _id: '', name: 'Tất cả', icon: '🌟', color: '#E60067' };

export default function ProductCategoryGrid({ categories, activeId, onChange }) {
  const items = [ALL_CATEGORY, ...categories.filter((c) => c._id !== '')];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xs">
      <div className="grid grid-cols-3 gap-2">
        {items.map((cat) => {
          const active = (cat._id || '') === (activeId || '');
          return (
            <button
              key={cat._id || 'all'}
              type="button"
              onClick={() => onChange(cat._id || '')}
              aria-pressed={active}
              className={[
                'group relative flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-center',
                'transition-all duration-300 ease-out',
                'active:scale-[0.94] active:duration-100',
                'will-change-transform',
                active
                  ? 'bg-pink-50 ring-1 ring-pink-300 shadow-[0_4px_12px_-4px_rgba(230,0,103,0.35)]'
                  : 'bg-slate-50 hover:bg-slate-100 hover:-translate-y-0.5',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-full text-lg',
                  'transition-all duration-300 ease-out',
                  active ? 'scale-110' : 'group-hover:scale-105',
                ].join(' ')}
                style={{
                  backgroundColor: active ? cat.color || '#E60067' : '#fff',
                  color: active ? '#fff' : (cat.color || '#E60067'),
                  boxShadow: active
                    ? '0 4px 10px -2px rgba(0,0,0,0.12)'
                    : 'inset 0 0 0 1px rgba(15,23,42,0.06)',
                }}
              >
                {cat.icon || '🛍️'}
              </span>
              <span
                className={[
                  'text-[10px] font-bold leading-tight transition-colors duration-300',
                  active ? 'text-[#E60067]' : 'text-slate-700',
                ].join(' ')}
              >
                {cat.name}
              </span>
              {active && (
                <span className="absolute -bottom-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-[#E60067] transition-all duration-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}