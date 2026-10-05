import { Link } from 'react-router-dom';
import { SparklesIcon, ShieldCheckIcon } from '../../icons/index.jsx';
import { useAuthStore } from '../../../store/authStore.js';

const PORTAL_LABEL = 'Cổng thông tin Web';
const WELCOME = 'Chào mừng bạn đến với Cổng thông tin Web Hộ Chiếu An Toàn (Loom for Women)';
const ENDORSEMENT = 'Bảo trợ ESG & An sinh Nữ Công Nhân';

export default function TopBar() {
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');

  return (
    <div className="hidden bg-gradient-to-r from-pink-600 via-[#E60067] to-rose-600 text-white shadow-xs md:block">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs">
        {/* Trái: badge cổng + lời chào */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            <SparklesIcon className="h-3 w-3" />
            {PORTAL_LABEL}
          </span>
          <span className="text-[11px] font-medium text-pink-50 sm:text-xs">
            {WELCOME}
          </span>
        </div>

        {/* Phải: link admin (nếu là admin) + lời bảo trợ */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white transition-colors hover:bg-white/30"
            >
              🛡️ Quản trị
            </Link>
          )}
          <span className="hidden items-center gap-1 text-[11px] font-semibold text-pink-100 sm:inline-flex">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-300" />
            {ENDORSEMENT}
          </span>
        </div>
      </div>
    </div>
  );
}