import { EditIcon, TrashIcon, MessageCircleIcon } from '../icons/index.jsx';
import { usePassportStore } from '../../store/passportStore.js';

export default function MyProductsGrid() {
  const myProducts = usePassportStore((s) => s.myProducts);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900">
          Sản phẩm bạn đã đăng ({myProducts.length})
        </h3>
        <button className="text-[10px] font-bold text-[#E60067] hover:underline uppercase tracking-wide">
          + Đăng sản phẩm mới
        </button>
      </div>

      {myProducts.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-xs">Bạn chưa đăng sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {myProducts.map((product) => {
            const discountPct = product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    alt={product.title}
                    className="w-full h-full object-cover"
                    src={product.imageUrl || product.thumbnail}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        Hết hàng
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2.5 flex-1 flex flex-col">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                    {product.title}
                  </h4>
                  <div className="mt-1.5">
                    <span className="text-xs font-black text-[#16a34a]">
                      {product.price.toLocaleString('vi-VN')} VND
                    </span>
                    {discountPct > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-slate-400 line-through">
                          {product.originalPrice.toLocaleString('vi-VN')} VND
                        </span>
                        <span className="text-rose-500 font-bold">-{discountPct}%</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Còn lại: <span className="font-bold">{product.stock}</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center gap-1.5">
                    <button
                      className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Chỉnh sửa"
                    >
                      <EditIcon className="w-3 h-3" />
                      Sửa
                    </button>
                    <button
                      className="flex-1 bg-pink-50 hover:bg-pink-100 text-[#E60067] text-[10px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Xem tin nhắn"
                    >
                      <MessageCircleIcon className="w-3 h-3" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center">
        <p className="text-[10px] text-slate-400 italic">
          Quản lý sản phẩm đầy đủ sẽ được bổ sung trong phiên bản tiếp theo.
        </p>
      </div>
    </div>
  );
}
