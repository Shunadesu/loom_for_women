import { GiftIcon, TrophyIcon } from '../icons/index.jsx';
import { useAuthStore } from '../../store/authStore.js';

const MOCK_GIFTS = [
  {
    id: 1,
    title: 'Voucher giảm 50k cho đơn từ 200k',
    thumbnail: '🎟️',
    pointsCost: 100,
    stock: 50,
    description: 'Áp dụng cho mua sắm tại Chợ sinh kế Loom',
  },
  {
    id: 2,
    title: 'Bộ dụng cụ móc len cơ bản',
    thumbnail: '🧶',
    pointsCost: 200,
    stock: 10,
    description: 'Kim móc size 3.0, 3.5, 4.0 + túi đựng canvas',
  },
  {
    id: 3,
    title: 'Chứng chỉ "Hiệp sĩ An toàn số" in khung',
    thumbnail: '🏆',
    pointsCost: 300,
    stock: 5,
    description: 'Chứng chỉ giấy A4 có đóng khung, gửi tận nhà',
  },
];

export default function GiftsList() {
  const points = useAuthStore((s) => s.points);

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-3 border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <TrophyIcon className="w-4 h-4 text-amber-500" />
              Điểm thưởng của bạn
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Đổi điểm lấy quà tặng và ưu đãi đặc biệt
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-600">{points}</span>
            <p className="text-[9px] text-slate-500 uppercase font-bold">điểm</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <GiftIcon className="w-4 h-4 text-[#E60067]" />
          Danh sách quà tặng
        </h3>
      </div>

      <div className="space-y-2.5">
        {MOCK_GIFTS.map((gift) => {
          const canAfford = points >= gift.pointsCost;

          return (
            <div
              key={gift.id}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-pink-200 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center text-2xl shrink-0 border border-pink-100">
                  {gift.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {gift.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                    {gift.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs font-black text-amber-600">
                      {gift.pointsCost} điểm
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • Còn {gift.stock} suất
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-50">
                <button
                  disabled={!canAfford}
                  className={[
                    'w-full text-[10px] font-bold py-1.5 rounded-lg transition-colors',
                    canAfford
                      ? 'bg-[#E60067] hover:bg-[#c90059] text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                  ].join(' ')}
                >
                  {canAfford ? 'Đổi quà ngay' : `Cần thêm ${gift.pointsCost - points} điểm`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
        <p className="text-[11px] text-blue-700 leading-relaxed">
          <span className="font-bold">💡 Mẹo tích điểm:</span> Hoàn thành khóa học +100 điểm, 
          hoàn thành bài học +5 điểm, bình luận +2 điểm.
        </p>
      </div>
    </div>
  );
}
