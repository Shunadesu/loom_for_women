import { useNavigate } from 'react-router-dom';
import { GraduationCapIcon, ShoppingBagIcon } from '../icons/index.jsx';

const CART_BADGE = 1; // tạm thời hardcode — sẽ nối useCartStore sau

export default function MyCourseCards() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Card 1: Khóa học của tôi — pink nền */}
      <button
        type="button"
        onClick={() => navigate('/khoa-hoc?tab=ongoing')}
        className="group relative overflow-hidden rounded-2xl bg-[#E60067] p-3.5 text-left text-white shadow-sm transition-all hover:opacity-95"
      >
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
          <GraduationCapIcon aria-hidden="true" className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xs font-bold leading-tight">Khóa học của tôi</h3>
        <p className="mt-0.5 text-[10px] text-pink-100 opacity-90">Bài học, tiến độ</p>
      </button>

      {/* Card 2: Giỏ hàng của tôi — trắng + badge */}
      <button
        type="button"
        className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 text-left text-slate-800 shadow-xs transition-all hover:bg-slate-50"
      >
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-pink-50 text-[#E60067]">
          <ShoppingBagIcon aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold leading-tight">Giỏ hàng của tôi</h3>
          <span className="rounded-full bg-[#E60067] px-1.5 py-0.5 text-[9px] font-bold text-white">
            {CART_BADGE}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">Đơn hàng hiện tại</p>
      </button>
    </div>
  );
}