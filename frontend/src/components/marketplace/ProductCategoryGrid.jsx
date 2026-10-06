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
              className={[
                'flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-all',
                active
                  ? 'bg-pink-50 ring-1 ring-pink-300'
                  : 'bg-slate-50 hover:bg-slate-100',
              ].join(' ')}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                style={{
                  backgroundColor: active ? cat.color || '#E60067' : '#fff',
                  color: active ? '#fff' : (cat.color || '#E60067'),
                }}
              >
                {cat.icon || '🛍️'}
              </span>
              <span
                className={[
                  'text-[10px] font-bold leading-tight',
                  active ? 'text-[#E60067]' : 'text-slate-700',
                ].join(' ')}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}