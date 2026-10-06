import { PackageIcon, ClockIcon, CheckCircleIcon } from '../icons/index.jsx';
import { usePassportStore } from '../../store/passportStore.js';

const STATUS_LABELS = {
  pending: { label: 'Chờ xử lý', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  shipped: { label: 'Đang giao', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  delivered: { label: 'Đã giao', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  done: { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-50 text-red-700 border-red-200' },
};

export default function OrdersList() {
  const myOrders = usePassportStore((s) => s.myOrders);
  const pendingCount = myOrders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <PackageIcon className="w-4 h-4 text-[#E60067]" />
          Đơn hàng khách đặt
        </h3>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {pendingCount} đơn chờ xử lý
          </span>
        )}
      </div>

      {myOrders.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-xs">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {myOrders.map((order) => {
            const statusStyle = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
            const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN');

            return (
              <div
                key={order._id}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-pink-200 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{order.orderCode}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.color}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {orderDate}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Khách hàng:</span>
                    <span className="font-bold text-slate-900">
                      {order.buyerName} • {order.buyerPhone}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Sản phẩm:</span>
                    <span className="font-semibold text-slate-700 text-right">
                      {order.productTitle}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Số lượng:</span>
                    <span className="font-bold text-slate-900">{order.quantity}</span>
                  </div>
                  <div className="flex items-start justify-between pt-1.5 border-t border-slate-50">
                    <span className="text-slate-500">Tổng tiền:</span>
                    <span className="font-black text-[#16a34a]">
                      {order.totalPrice.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button className="flex-1 bg-[#E60067] hover:bg-[#c90059] text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors">
                        Xác nhận đơn
                      </button>
                      <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg transition-colors">
                        Liên hệ khách
                      </button>
                    </>
                  )}
                  {order.status === 'shipped' && (
                    <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold py-1.5 rounded-lg transition-colors">
                      Đánh dấu đã giao
                    </button>
                  )}
                  {order.status === 'done' && (
                    <div className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Đã hoàn thành
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center">
        <p className="text-[10px] text-slate-400 italic">
          Hệ thống quản lý đơn hàng đầy đủ sẽ được bổ sung trong phiên bản tiếp theo.
        </p>
      </div>
    </div>
  );
}
