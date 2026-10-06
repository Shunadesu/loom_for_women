import { QrCodeIcon } from '../icons/index.jsx';
import { usePassportStore } from '../../store/passportStore.js';

export default function PassportCard() {
  const passport = usePassportStore((s) => s.passport);

  if (!passport) return null;

  const { profile, stats, badges } = passport;
  const monthlyIncome = Math.round(stats.sideIncome / 1000); // Convert to thousands

  return (
    <div className="bg-gradient-to-br from-[#E60067] via-[#f72585] to-rose-600 text-white p-4 rounded-2xl border border-pink-300/40 shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[9px] bg-white/20 text-white font-extrabold px-2.5 py-0.5 rounded-full border border-white/30 uppercase tracking-widest">
            LOOM PASSPORT #{profile.passportSerial}
          </span>
          <h3 className="text-sm font-bold text-white mt-1">HỘ CHIẾU AN TOÀN SỐ</h3>
        </div>
        <div className="bg-white p-1 rounded-lg shadow-sm">
          <QrCodeIcon className="w-9 h-9 text-[#E60067]" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 my-4 bg-white/15 p-2.5 rounded-xl border border-white/20 text-center">
        <div>
          <p className="text-[10px] text-pink-100">Khóa học xong</p>
          <p className="text-sm font-extrabold text-white mt-0.5">{stats.completedCourses || 0}</p>
        </div>
        <div>
          <p className="text-[10px] text-pink-100">Sản phẩm đăng</p>
          <p className="text-sm font-extrabold text-white mt-0.5">{stats.postedProducts || 0}</p>
        </div>
        <div>
          <p className="text-[10px] text-pink-100">Thu nhập phụ</p>
          <p className="text-[11px] font-extrabold text-white mt-0.5 bg-white/20 py-0.5 px-1.5 rounded-md inline-block">
            {monthlyIncome}kđ
          </p>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-pink-100 font-medium mb-1.5">Huy hiệu đã đạt được:</p>
        <div className="flex flex-wrap gap-1.5">
          {badges && badges.length > 0 ? (
            badges.map((badge, i) => (
              <span
                key={i}
                className="bg-white text-[#E60067] font-bold text-[10px] px-2.5 py-1 rounded-full border border-pink-100 shadow-xs"
              >
                {badge}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-pink-100 italic">
              Chưa có huy hiệu. Học thêm để nhận!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
