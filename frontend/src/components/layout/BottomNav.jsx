import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useLoginDrawerStore } from '../../store/loginDrawerStore.js';
import {
  HomeIcon,
  GraduationCapIcon,
  ShopIcon,
  UserIcon,
} from '../icons/index.jsx';

export default function BottomNav() {
  const user = useAuthStore((s) => s.user);
  const openLoginDrawer = useLoginDrawerStore((s) => s.openLoginDrawer);

  const tabs = [
    {
      to: '/',
      label: 'Trang chủ',
      icon: HomeIcon,
      end: true,
      requireAuth: false,
    },
    {
      to: '/khoa-hoc',
      label: 'Khóa học',
      icon: GraduationCapIcon,
      end: false,
      requireAuth: false,
    },
    {
      to: '/cua-hang',
      label: 'Cửa hàng',
      icon: ShopIcon,
      end: false,
      requireAuth: false,
    },
    {
      to: '/he-chieu',
      label: 'Cá nhân',
      icon: UserIcon,
      end: false,
      requireAuth: true,
    },
  ];

  function handleTabClick(e, tab) {
    if (tab.requireAuth && !user) {
      e.preventDefault();
      openLoginDrawer(tab.to);
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-100 bg-white px-3 py-1.5 shadow-lg md:hidden">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          onClick={(e) => handleTabClick(e, tab)}
          className={({ isActive }) =>
            `flex flex-col items-center rounded-xl px-3 py-1 transition-colors duration-200 ${
              isActive
                ? 'font-bold text-[#E60067]'
                : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <tab.icon className="mb-0.5 h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
