import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  MenuIcon,
  XIcon,
} from '../../icons/index.jsx';
import { useForumStore } from '../../../store/forumStore.js';
import { useExpertQAStore } from '../../../store/expertQAStore.js';
import { useSupportStore } from '../../../store/supportStore.js';
import { useAuthStore } from '../../../store/authStore.js';
import { useLoginDrawerStore } from '../../../store/loginDrawerStore.js';

const PRIMARY = [
  { to: '/', label: 'Trang chủ', icon: HomeIcon, end: true },
  { to: '/khoa-hoc', label: 'Khóa học E-learning', icon: GraduationCapIcon },
  { to: '/cua-hang', label: 'Cửa hàng sinh kế', icon: ShopIcon },
  { to: '/thu-vien', label: 'Thư viện tài liệu', icon: FileTextIcon },
  { to: '/he-chieu', label: 'Hộ Chiếu An Toàn', icon: UserIcon, requireAuth: true },
];

// `tone: 'pink'` = nút nổi bật (hồng), còn lại dùng slate
const UTILITY = [
  { to: '/workshop', label: 'Workshop', icon: HeartIcon, tone: 'pink' },
  {
    label: 'Hỏi chuyên gia',
    icon: QuestionMarkIcon,
    iconClass: 'text-amber-500',
    isModal: true,
    modalType: 'expertQA',
  },
  {
    label: 'Diễn đàn',
    icon: ShareIcon,
    iconClass: 'text-blue-500',
    isModal: true,
    modalType: 'forum',
  },
  {
    label: 'Hỗ trợ 24/7',
    icon: PhoneCallIcon,
    iconClass: 'text-emerald-600',
    isModal: true,
    modalType: 'support',
  },
];

function PrimaryItem({ to, label, icon: Icon, end, requireAuth, onNavigate, mobile }) {
  const user = useAuthStore((s) => s.user);
  const openLoginDrawer = useLoginDrawerStore((s) => s.openLoginDrawer);

  const handleClick = (e) => {
    if (requireAuth && !user) {
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
          'inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
          isActive
            ? 'bg-[#E60067] text-white shadow-xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          mobile ? 'w-full justify-start py-2.5' : '',
        ].join(' ')
      }
    >
      <Icon className={mobile ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      <span>{label}</span>
    </NavLink>
  );
}

function UtilityItem({ to, label, icon: Icon, iconClass, tone, isModal, modalType, mobile, compact, onClose }) {
  const openExpertQA = useExpertQAStore((s) => s.openModal);
  const openForum = useForumStore((s) => s.openForum);
  const openSupport = useSupportStore((s) => s.openModal);
  const isPink = tone === 'pink';
  
  const className = [
    'inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors',
    isPink
      ? 'bg-pink-50 text-pink-700 hover:bg-pink-100'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    mobile ? 'w-full justify-start py-2.5 text-xs' : '',
    compact ? 'px-2' : '',
  ].join(' ');

  const iconElement = (
    <Icon className={`${compact ? 'h-3.5 w-3.5' : mobile ? 'h-4 w-4' : 'h-3 w-3'} ${iconClass || (isPink ? 'text-[#E60067]' : '')}`} />
  );

  // If it's a modal trigger
  if (isModal) {
    const handleClick = () => {
      if (modalType === 'expertQA') {
        openExpertQA();
      } else if (modalType === 'forum') {
        openForum();
      } else if (modalType === 'support') {
        openSupport();
      }
      if (onClose) onClose();
    };

    return (
      <button
        onClick={handleClick}
        className={className}
        title={label}
      >
        {iconElement}
        {!compact && <span>{label}</span>}
      </button>
    );
  }

  // Regular NavLink
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={className}
      title={label}
    >
      {iconElement}
      {!compact && <span>{label}</span>}
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
        
        {/* Utility buttons - always visible on mobile */}
        <div className="flex items-center gap-1.5">
          {UTILITY.slice(0, 2).map((item, index) => (
            <UtilityItem key={item.to || item.label || index} {...item} compact />
          ))}
        </div>
      </div>

      {/* Desktop: Primary nav (always visible) */}
      <nav className="hidden items-center gap-1 sm:flex">
        {PRIMARY.map((item) => (
          <PrimaryItem key={item.to} {...item} onNavigate={closeMenu} />
        ))}
      </nav>

      {/* Desktop: Utility nav (always visible) */}
      <div className="hidden items-center gap-1.5 sm:flex">
        {UTILITY.map((item, index) => (
          <UtilityItem key={item.to || item.label || index} {...item} />
        ))}
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

              {/* Utility navigation */}
              <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                {UTILITY.map((item, index) => (
                  <motion.div
                    key={item.to || item.label || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (PRIMARY.length + index) * 0.05, duration: 0.2 }}
                  >
                    <UtilityItem {...item} mobile onClose={closeMenu} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}