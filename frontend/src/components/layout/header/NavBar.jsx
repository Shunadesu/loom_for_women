import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  GraduationCapIcon,
  ShopIcon,
  FileTextIcon,
  UserIcon,
  HeartIcon,
  QuestionMarkIcon,
  ShareIcon,
  PhoneCallIcon,
} from '../../icons/index.jsx';

const PRIMARY = [
  { to: '/', label: 'Trang chủ', icon: HomeIcon, end: true },
  { to: '/khoa-hoc', label: 'Khóa học E-learning', icon: GraduationCapIcon },
  { to: '/cua-hang', label: 'Cửa hàng sinh kế', icon: ShopIcon },
  { to: '/thu-vien', label: 'Thư viện tài liệu', icon: FileTextIcon },
  { to: '/he-chieu', label: 'Hộ Chiếu An Toàn', icon: UserIcon },
];

// `tone: 'pink'` = nút nổi bật (hồng), còn lại dùng slate
const UTILITY = [
  { to: '/workshop', label: 'Workshop', icon: HeartIcon, tone: 'pink' },
  {
    to: '/hoi-chuyen-gia',
    label: 'Hỏi chuyên gia',
    icon: QuestionMarkIcon,
    iconClass: 'text-amber-500',
  },
  {
    to: '/dien-dan',
    label: 'Diễn đàn',
    icon: ShareIcon,
    iconClass: 'text-blue-500',
  },
  {
    to: '/ho-tro',
    label: 'Hỗ trợ 24/7',
    icon: PhoneCallIcon,
    iconClass: 'text-emerald-600',
  },
];

function PrimaryItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
          isActive
            ? 'bg-[#E60067] text-white shadow-xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </NavLink>
  );
}

function UtilityItem({ to, label, icon: Icon, iconClass, tone }) {
  const isPink = tone === 'pink';
  return (
    <NavLink
      to={to}
      className={[
        'inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors',
        isPink
          ? 'bg-pink-50 text-pink-700 hover:bg-pink-100'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      ].join(' ')}
      title={label}
    >
      <Icon className={`h-3 w-3 ${iconClass || (isPink ? 'text-[#E60067]' : '')}`} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function NavBar() {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
      <nav className="scrollbar-none flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
        {PRIMARY.map((item) => (
          <PrimaryItem key={item.to} {...item} />
        ))}
      </nav>
      <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {UTILITY.map((item) => (
          <UtilityItem key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}