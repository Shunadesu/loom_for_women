import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  GraduationCapIcon,
  UserIcon,
  MenuIcon,
  XIcon,
} from '../../icons/index.jsx';
import { useAuthStore } from '../../../store/authStore.js';
import { useLoginDrawerStore } from '../../../store/loginDrawerStore.js';

// Thanh header chỉ giữ 3 mục chính.
// `requireAuth` = chưa đăng nhập thì mở LoginDrawer thay vì điều hướng.
const PRIMARY = [
  { to: '/', label: 'Trang chủ', icon: HomeIcon, end: true },
  { to: '/khoa-hoc', label: 'Khóa học E-learning', icon: GraduationCapIcon },
  { to: '/he-chieu', label: 'Cá nhân', icon: UserIcon, requireAuth: true },
];

const PORTAL_STATUS = 'Cổng thông tin Hộ Chiếu An Toàn Trực Tuyến';

function PrimaryItem({ to, label, icon: Icon, end, requireAuth, onNavigate, mobile }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openLoginDrawer = useLoginDrawerStore((s) => s.openLoginDrawer);

  const handleClick = (e) => {
    if (requireAuth && !isAuthenticated) {
      e.preventDefault();
      openLoginDrawer(to);
    }
    if (onNavigate) onNavigate();
  };

  return (
    <NavLink
      to={to}
      end={end}
      onClick={handleClick}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold transition-all sm:text-sm',
          isActive
            ? 'bg-[#E60067] text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          mobile ? 'w-full justify-start py-2.5' : '',
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
      {/* Mobile: Hamburger button */}
      <div className="flex w-full items-center justify-between sm:hidden">
        <motion.button
          onClick={toggleMenu}
          className={[
            'relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold shadow-sm transition-all duration-300',
            isMenuOpen
              ? 'bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 text-[#E60067] shadow-md'
              : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 text-slate-700 hover:shadow-md',
          ].join(' ')}
          aria-label="Toggle menu"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            className="relative z-10"
            initial={false}
            animate={{ rotate: isMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {isMenuOpen ? (
              <XIcon className="h-4 w-4" />
            ) : (
              <MenuIcon className="h-4 w-4" />
            )}
          </motion.div>
          <span className="relative z-10">{isMenuOpen ? 'Đóng menu' : 'Menu'}</span>

          {/* Animated gradient backdrop */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isMenuOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </div>

      {/* Desktop: Primary nav (always visible) */}
      <nav className="hidden items-center gap-2 sm:flex">
        {PRIMARY.map((item) => (
          <PrimaryItem key={item.to} {...item} onNavigate={closeMenu} />
        ))}
      </nav>

      {/* Desktop: status indicator */}
      <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 lg:flex">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        <span>{PORTAL_STATUS}</span>
      </div>

      {/* Mobile: Slide-down menu with animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full overflow-hidden sm:hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-3 pt-3"
            >
              {/* Primary navigation */}
              <nav className="flex flex-col gap-1.5">
                {PRIMARY.map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <PrimaryItem {...item} onNavigate={closeMenu} mobile />
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
