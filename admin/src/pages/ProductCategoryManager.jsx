import { useEffect } from 'react';
import { useProductStore } from '../store/productStore.js';

export default function ProductCategoryManager() {
  const categories = useProductStore((s) => s.categories);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);
  const fetchCategories = useProductStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-slate-900">
          Quản lý Danh mục Sản phẩm
        </h1>
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
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Chưa có danh mục sản phẩm nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                  Icon
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                  Tên
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                  Slug
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-700">
                  Active
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-lg">{item.icon || '🛍️'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{item.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={[
                        'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold',
                        item.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500',
                      ].join(' ')}
                    >
                      {item.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
