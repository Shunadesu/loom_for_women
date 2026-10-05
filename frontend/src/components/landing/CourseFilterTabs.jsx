const TABS = [
  { id: 'unstarted', label: 'Chưa học' },
  { id: 'ongoing', label: 'Đang học' },
  { id: 'completed', label: 'Đã hoàn tất' },
];

export default function CourseFilterTabs({ active, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            id={`filter-${t.id}-btn`}
            type="button"
            onClick={() => onChange(t.id)}
            className={[
              'truncate rounded-full border px-2 py-2 text-center text-[11px] font-bold transition-all',
              isActive
                ? 'border-transparent bg-[#E60067] text-white shadow-xs'
                : 'border-pink-200/80 bg-pink-50 text-[#E60067] hover:bg-pink-100',
            ].join(' ')}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}