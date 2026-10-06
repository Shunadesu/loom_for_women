import { TrendingUpIcon } from '../icons/index.jsx';
import { usePassportStore } from '../../store/passportStore.js';

export default function IncomeCard() {
  const passport = usePassportStore((s) => s.passport);

  if (!passport) return null;

  const monthlyIncome = passport.stats.sideIncome;
  const growthPercent = 35; // TODO: Calculate based on historical data

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
      <h4 className="font-bold text-slate-900 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <TrendingUpIcon className="w-4 h-4 text-[#E60067]" />
          <span className="text-xs">Hiệu quả Sinh kế & Thu nhập phụ</span>
        </span>
        <span className="text-[#E60067] font-extrabold text-xs">
          +{monthlyIncome.toLocaleString('vi-VN')} VND / tháng
        </span>
      </h4>
      <p className="text-[11px] text-slate-500 leading-snug">
        Nhờ học làm đồ thủ công và đăng bán trên Chợ sinh kế Loom, thu nhập ngoài giờ của bạn tăng{' '}
        <b className="text-slate-700">+{growthPercent}%</b> so với trước.
      </p>
    </div>
  );
}
