import { useNavigate } from 'react-router-dom';
import { GraduationCapIcon, ShoppingBagIcon } from '../icons/index.jsx';
import { useCartStore } from '../../store/cartStore.js';

export default function PassportActionCards() {
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.count);

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => navigate('/khoa-hoc?tab=ongoing')}
        className="bg-[#E60067] hover:bg-[#c90059] text-white p-3.5 rounded-2xl shadow-md text-left transition-all group flex flex-col justify-between"
      >
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2 group-hover:scale-105 transition-transform">
          <GraduationCapIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-extrabold text-xs text-white">Khóa học của tôi</h3>
          <p className="text-[10px] text-pink-100 mt-0.5">Bài học, tiến độ</p>
        </div>
      </button>

      <button
        className="bg-white hover:bg-pink-50/50 p-3.5 rounded-2xl border border-slate-100 shadow-xs text-left transition-all group flex flex-col justify-between relative"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#E60067] flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShoppingBagIcon className="w-5 h-5 text-[#E60067]" />
          </div>
          {cartCount > 0 && (
            <span className="bg-[#E60067] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
              {cartCount}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-extrabold text-xs text-slate-900">Giỏ hàng của tôi</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Sản phẩm đang chọn mua</p>
        </div>
      </button>
    </div>
  );
}
