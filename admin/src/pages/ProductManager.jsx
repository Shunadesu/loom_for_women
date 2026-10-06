import { useEffect } from 'react';
import { useProductStore } from '../store/productStore.js';

export default function ProductManager() {
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);
  const fetchAll = useProductStore((s) => s.fetchAll);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-slate-900">Quản lý Sản phẩm</h1>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg bg-[#E60067] px-3 py-2 text-sm font-bold text-white hover:bg-[#d0005a]"
        >
          + Thêm mới
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Đang tải...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Chưa có sản phẩm nào.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((item) => (
            <div
              key={item._id}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition-all hover:shadow-sm"
            >
              <div className="aspect-square w-full overflow-hidden bg-slate-50">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-slate-300">
                    📦
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.category?.name || 'Chưa phân loại'}
                </p>
                <p className="mt-2 text-sm font-extrabold text-[#E60067]">
                  {item.price ? `${item.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                </p>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    className="flex-1 rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-lg bg-red-50 px-2 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-100"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
