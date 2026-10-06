import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/heroes', label: 'Hero Banner', icon: '🖼️' },
  { to: '/categories', label: 'Danh mục KH', icon: '📁' },
  { to: '/courses', label: 'Khóa học', icon: '📚' },
  { to: '/product-categories', label: 'Danh mục SP', icon: '🛍️' },
  { to: '/products', label: 'Sản phẩm', icon: '📦' },
  { to: '/users', label: 'Người dùng', icon: '👥', soon: true },
  { to: '/config', label: 'Cấu hình', icon: '⚙️', soon: true },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white px-3 py-6 md:block">
      <nav className="space-y-1">
        {NAV.map((item) => {
          if (item.soon) {
            return (
              <div
                key={item.to}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300"
                title="Sắp ra mắt"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                  Soon
                </span>
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-pink-50 text-[#E60067]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}