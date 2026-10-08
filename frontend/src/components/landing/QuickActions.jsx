import { Link } from 'react-router-dom';
import { QUICK_ACTIONS } from '../../data/homeContent.js';

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-slate-100/80 bg-white p-3.5 shadow-xs">
      <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-6">
        {QUICK_ACTIONS.map(({ id, label, Icon, to, cursor }) => (
          <Link
            key={id}
            to={to}
            className={`group flex flex-col items-center gap-1.5${cursor ? ' cursor-pointer' : ''}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 text-[#E60067] shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md">
              <Icon aria-hidden="true" className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-semibold leading-tight text-slate-700 group-hover:text-[#E60067]">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}