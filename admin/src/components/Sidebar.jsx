import { NavLink } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from './icons.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/showcase', label: 'Dashboard Showcase', icon: '🎯' },
  { to: '/heroes', label: 'Hero Banner', icon: '🖼️' },
  { to: '/categories', label: 'Danh mục KH', icon: '📁' },
  { to: '/courses', label: 'Khóa học', icon: '📚' },
  { to: '/product-categories', label: 'Danh mục SP', icon: '🛍️' },
  { to: '/products', label: 'Sản phẩm', icon: '📦' },
  { to: '/forum-posts', label: 'Diễn đàn', icon: '💬' },
  { to: '/users', label: 'Người dùng', icon: '👥' },
  { to: '/config', label: 'Cấu hình', icon: '⚙️', soon: true },
];

export default function Sidebar({ collapsed = false, onToggle }) {
  return (
    <aside
      className={`hidden shrink-0 border-r border-slate-200 bg-white py-3 transition-all duration-200 md:block ${
        collapsed ? 'w-14 px-1' : 'w-56 px-2'
      }`}
    >
      <nav className="space-y-1">
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          className={`flex w-full items-center rounded-md py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 ${
            collapsed ? 'justify-center px-1' : 'gap-2 px-2'
          }`}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              <span>Thu gọn</span>
            </>
          )}
        </button>

        {NAV.map((item) => {
          if (item.soon) {
            return (
              <div
                key={item.to}
                title={collapsed ? item.label : 'Sắp ra mắt'}
                className={`flex cursor-not-allowed items-center rounded-md py-2 text-xs font-medium text-slate-300 ${
                  collapsed ? 'justify-center px-1' : 'gap-2 px-2'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && (
                  <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                    Soon
                  </span>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-md py-2 text-xs font-medium transition-colors ${
                  collapsed ? 'justify-center px-1' : 'gap-2 px-2'
                } ${
                  isActive
                    ? 'bg-pink-50 text-[#E60067]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
