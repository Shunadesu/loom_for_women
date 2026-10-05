import { Link } from 'react-router-dom';
import { QUICK_ACTIONS } from '../../data/homeContent.js';

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-slate-100/80 bg-white p-3.5 shadow-xs">
      <div className="grid grid-cols-5 gap-2 text-center">
        {QUICK_ACTIONS.map(({ id, label, Icon, to, cursor }) => (
          <Link
            key={id}
            to={to}
            className={`group flex flex-col items-center${cursor ? ' cursor-pointer' : ''}`}
          >
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-50 text-[#E60067] transition-transform group-hover:scale-105">
              <Icon aria-hidden="true" className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}