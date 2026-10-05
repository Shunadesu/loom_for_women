import { Link } from 'react-router-dom';
import {
  CirclePlusIcon,
  ShoppingBagIcon,
} from '../../icons/index.jsx';
import { useAuthStore } from '../../../store/authStore.js';

const BRAND_TITLE = 'HỘ CHIẾU AN TOÀN';
const BRAND_BADGE = 'Loom for Women';
const BRAND_DESC =
  'Nâng cao năng lực số & bảo vệ sinh kế cho nữ công nhân lao động';

function getInitial(name) {
  if (!name) return 'L';
  return name.trim().charAt(0).toUpperCase();
}

export default function BrandBar() {
  const user = useAuthStore((s) => s.user);
  const points = useAuthStore((s) => s.points);
  const level = useAuthStore((s) => s.level);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Trái: logo + brand */}
      <Link to="/" className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E60067] px-2.5 py-1 shadow-xs">
          <img
            src="/logo.png"
            alt="Logo Loom for Women"
            className="h-full w-auto max-w-[130px] object-contain"
            style={{ filter: 'url(#remove-pink-to-white)' }}
          />
        </div>
        <div className="min-w-0 leading-tight">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-black tracking-tight text-slate-900 sm:text-lg">
              {BRAND_TITLE}
            </span>
            <span className="rounded-md bg-pink-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E60067]">
              {BRAND_BADGE}
            </span>
          </div>
          <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
            {BRAND_DESC}
          </p>
        </div>
      </Link>

      {/* Phải: actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          title="Đăng bán sản phẩm 1-Click"
          className="hidden cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E60067] to-rose-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition-all hover:from-pink-600 hover:to-rose-700 hover:shadow-sm md:flex"
        >
          <CirclePlusIcon className="h-4 w-4" />
          <span>Đăng bán sản phẩm</span>
        </button>

        <button
          type="button"
          title="Giỏ hàng của bạn"
          className="relative cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-700 transition-all hover:border-pink-300 hover:bg-pink-50 hover:text-[#E60067]"
        >
          <ShoppingBagIcon className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#E60067] text-[10px] font-black text-white shadow-xs">
            1
          </span>
        </button>

        <button
          type="button"
          title="Hồ sơ tài khoản / Đăng nhập"
          className="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-1.5 transition-all hover:border-pink-300 hover:bg-pink-50/50 sm:px-3 sm:py-1.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-pink-200 bg-pink-100 text-xs font-bold text-[#E60067]">
            {getInitial(user?.name)}
          </div>
          <div className="hidden text-left sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 transition-colors group-hover:text-[#E60067]">
                {user?.name || 'Khách'}
              </span>
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                Cấp {level ?? 1}
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-pink-600">
              ★ {points} Points
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}