import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CirclePlusIcon,
  ShoppingBagIcon,
  UserIcon,
  ChevronDownIcon,
  LogOutIcon,
  HeartIcon,
  FileTextIcon,
  TrophyIcon,
  GraduationCapIcon,
} from '../../icons/index.jsx';
import { useAuthStore } from '../../../store/authStore.js';
import { useCartStore } from '../../../store/cartStore.js';
import { useLoginDrawerStore } from '../../../store/loginDrawerStore.js';
import CartDrawer from '../../cart/CartDrawer.jsx';
import QuickSellModal from '../../marketplace/QuickSellModal.jsx';

const BRAND_TITLE = 'HỘ CHIẾU AN TOÀN';
const BRAND_BADGE = 'Loom for Women';
const BRAND_DESC =
  'Nâng cao năng lực số & bảo vệ sinh kế cho nữ công nhân lao động';

function getInitial(name) {
  if (!name) return 'L';
  return name.trim().charAt(0).toUpperCase();
}

export default function BrandBar() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickSellOpen, setIsQuickSellOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const points = useAuthStore((s) => s.points);
  const level = useAuthStore((s) => s.level);
  const logout = useAuthStore((s) => s.logout);
  const count = useCartStore((s) => s.count);
  const openLoginDrawer = useLoginDrawerStore((s) => s.openLoginDrawer);

  const isAuthenticated = Boolean(token || user?._id);

  const handleQuickSellClick = () => {
    if (!isAuthenticated) {
      // Chưa đăng nhập → mở drawer đăng nhập, sau đó user có thể bấm lại nút.
      openLoginDrawer('/');
      return;
    }
    setIsQuickSellOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4">
      {/* Trái: logo + brand */}
      <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E60067] p-1.5 shadow-xs sm:h-12 sm:w-auto sm:px-2.5 sm:py-1">
          <img
            src="/logo.png"
            alt="Logo Loom for Women"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          {/* Mobile: 1 dòng title ngắn, không badge để tránh tràn */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="truncate text-[15px] font-black tracking-tight text-slate-900 sm:text-base sm:text-lg">
              {BRAND_TITLE}
            </span>
            <span className="hidden shrink-0 rounded-md bg-pink-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E60067] sm:inline-block sm:px-2">
              {BRAND_BADGE}
            </span>
          </div>
          <p className="hidden truncate text-[11px] font-medium text-slate-500 sm:block">
            {BRAND_DESC}
          </p>
        </div>
      </Link>

      {/* Phải: actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleQuickSellClick}
          title="Đăng bán sản phẩm 1-Click"
          className="hidden cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E60067] to-rose-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition-all hover:from-pink-600 hover:to-rose-700 hover:shadow-sm md:flex"
        >
          <CirclePlusIcon className="h-4 w-4" />
          <span>Đăng bán sản phẩm</span>
        </button>

        <button
          type="button"
          title="Giỏ hàng của bạn"
          onClick={() => setIsCartOpen(true)}
          className="relative cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-700 transition-all hover:border-pink-300 hover:bg-pink-50 hover:text-[#E60067]"
        >
          <ShoppingBagIcon className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#E60067] text-[10px] font-black text-white shadow-xs">
              {count}
            </span>
          )}
        </button>

        {/* Auth Section */}
        {!token ? (
          /* Chưa đăng nhập - Hiển thị nút Đăng nhập */
          <button
            onClick={() => openLoginDrawer('/')}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-700 transition-all hover:border-pink-300 hover:bg-pink-50 hover:text-[#E60067] sm:px-4"
          >
            <UserIcon className="h-5 w-5" />
            <span className="hidden text-sm font-bold sm:inline">Đăng nhập</span>
          </button>
        ) : (
          /* Đã đăng nhập - Hiển thị profile với dropdown */
          <div className="relative" ref={dropdownRef}>
            <motion.button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-1.5 transition-all hover:border-pink-300 hover:bg-pink-50/50 sm:px-3 sm:py-1.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-pink-200 bg-pink-100 text-xs font-bold text-[#E60067]">
                {getInitial(user?.name)}
              </div>
              <div className="hidden text-left sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 transition-colors group-hover:text-[#E60067]">
                    {user?.name || 'Người dùng'}
                  </span>
                  <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                    Cấp {level}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-pink-600">
                  ★ {points} Points
                </span>
              </div>
              <ChevronDownIcon 
                className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                >
                  {/* User Info Header */}
                  <div className="border-b border-slate-100 bg-gradient-to-br from-pink-50 to-white p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-pink-200 bg-pink-100 text-sm font-bold text-[#E60067]">
                        {getInitial(user?.name)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-600">
                          Cấp {level} • {points} điểm
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1">
                    <Link
                      to="/he-chieu"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-pink-50 hover:text-[#E60067]"
                    >
                      <UserIcon className="h-4 w-4" />
                      Hộ Chiếu An Toàn
                    </Link>
                    
                    <Link
                      to="/khoa-hoc"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-pink-50 hover:text-[#E60067]"
                    >
                      <GraduationCapIcon className="h-4 w-4" />
                      Khóa học của tôi
                    </Link>

                    <Link
                      to="/yeu-thich"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-pink-50 hover:text-[#E60067]"
                    >
                      <HeartIcon className="h-4 w-4" />
                      Yêu thích
                    </Link>

                    <Link
                      to="/chung-chi"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-pink-50 hover:text-[#E60067]"
                    >
                      <FileTextIcon className="h-4 w-4" />
                      Chứng chỉ
                    </Link>

                    <Link
                      to="/diem"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-pink-50 hover:text-[#E60067]"
                    >
                      <TrophyIcon className="h-4 w-4" />
                      Điểm thưởng
                    </Link>

                    <div className="my-1 border-t border-slate-100"></div>

                    <motion.button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                      whileHover={{ x: 2 }}
                    >
                      <LogOutIcon className="h-4 w-4" />
                      Đăng xuất
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Quick Sell Modal (Đăng bán sản phẩm 1-Click) */}
      <QuickSellModal
        isOpen={isQuickSellOpen}
        onClose={() => setIsQuickSellOpen(false)}
      />
    </div>
  );
}