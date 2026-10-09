import { useEffect, useMemo, useState } from 'react';
import { useProductStore } from '../store/productStore.js';
import ProductManagerModal from '../components/ProductManagerModal.jsx';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '../components/icons.jsx';

const SORTS = {
  name: (a, b) => a.title.localeCompare(b.title, 'vi'),
  price: (a, b) => (a.price || 0) - (b.price || 0),
  stock: (a, b) => (a.stock || 0) - (b.stock || 0),
  sales: (a, b) => (a.salesCount || 0) - (b.salesCount || 0),
  order: (a, b) => (a.order ?? 0) - (b.order ?? 0),
  created: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
};

export default function ProductManager() {
  const products = useProductStore((s) => s.products);
  const categories = useProductStore((s) => s.categories);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);
  const fetchAll = useProductStore((s) => s.fetchAll);
  const fetchCategories = useProductStore((s) => s.fetchCategories);
  const create = useProductStore((s) => s.create);
  const update = useProductStore((s) => s.update);
  const remove = useProductStore((s) => s.remove);

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [publishedFilter, setPublishedFilter] = useState('all'); // all | published | draft
  const [featuredFilter, setFeaturedFilter] = useState('all'); // all | featured | normal
  const [sortKey, setSortKey] = useState('order');
  const [sortDir, setSortDir] = useState('asc');
  const [modal, setModal] = useState(null); // null | { type: 'add' } | { type: 'edit', product }

  useEffect(() => {
    fetchAll();
    fetchCategories();
  }, [fetchAll, fetchCategories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q) {
        const hay = `${p.title || ''} ${p.sellerName || ''} ${p.sellerPhone || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (catFilter !== 'all') {
        const catId = typeof p.category === 'object' ? p.category?._id : p.category;
        if (catId !== catFilter) return false;
      }
      if (statusFilter === 'active' && !p.isActive) return false;
      if (statusFilter === 'inactive' && p.isActive) return false;
      if (publishedFilter === 'published' && !p.isPublished) return false;
      if (publishedFilter === 'draft' && p.isPublished) return false;
      if (featuredFilter === 'featured' && !p.isFeatured) return false;
      if (featuredFilter === 'normal' && p.isFeatured) return false;
      return true;
    });
  }, [products, query, catFilter, statusFilter, publishedFilter, featuredFilter]);

  const sorted = useMemo(() => {
    const fn = SORTS[sortKey] || SORTS.order;
    const list = [...filtered].sort(fn);
    return sortDir === 'asc' ? list : list.reverse();
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'created' ? 'desc' : 'asc');
    }
  }

  function SortHeader({ k, children, align = 'left' }) {
    const active = sortKey === k;
    return (
      <th
        scope="col"
        className={`px-2 py-2 text-[11px] font-bold uppercase text-slate-700 ${
          align === 'right' ? 'text-right' : 'text-left'
        }`}
      >
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={`inline-flex items-center gap-1 hover:text-[#E60067] ${
            active ? 'text-[#E60067]' : ''
          } ${align === 'right' ? 'flex-row-reverse' : ''}`}
        >
          {children}
          {active ? (
            sortDir === 'asc' ? (
              <ArrowUpIcon className="h-3 w-3" />
            ) : (
              <ArrowDownIcon className="h-3 w-3" />
            )
          ) : (
            <span className="text-slate-300">↕</span>
          )}
        </button>
      </th>
    );
  }

  async function handleSave(formData, editId) {
    if (editId) {
      await update(editId, formData);
    } else {
      await create(formData);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Xoá sản phẩm "${item.title}"?`)) return;
    try {
      await remove(item._id);
    } catch (err) {
      alert(err?.response?.data?.error || 'Xoá thất bại.');
    }
  }

  const hasFilter =
    query ||
    catFilter !== 'all' ||
    statusFilter !== 'all' ||
    publishedFilter !== 'all' ||
    featuredFilter !== 'all';

  function clearFilters() {
    setQuery('');
    setCatFilter('all');
    setStatusFilter('all');
    setPublishedFilter('all');
    setFeaturedFilter('all');
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-slate-900">Quản lý Sản phẩm</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Tổng {products.length} · đang hiển thị {sorted.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: 'add' })}
          className="flex items-center gap-1 rounded-md bg-[#E60067] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-[#d0005a]"
        >
          <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
          Thêm mới
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-md border border-slate-200 bg-white p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên, người bán, SĐT…"
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-7 pr-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#E60067] focus:outline-none focus:ring-1 focus:ring-[#E60067]/30"
            />
          </div>
          <FilterIcon
            aria-hidden="true"
            className="ml-auto h-3.5 w-3.5 text-slate-400"
          />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-[#E60067] focus:outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-[#E60067] focus:outline-none"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="active">Đang hiện</option>
            <option value="inactive">Đã ẩn</option>
          </select>
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-[#E60067] focus:outline-none"
          >
            <option value="all">Công khai & nháp</option>
            <option value="published">Đã công khai</option>
            <option value="draft">Bản nháp</option>
          </select>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-[#E60067] focus:outline-none"
          >
            <option value="all">Nổi bật & thường</option>
            <option value="featured">Nổi bật</option>
            <option value="normal">Thường</option>
          </select>
          {hasFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Xoá lọc
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        {loading && products.length === 0 ? (
          <div className="px-2 py-6 text-center text-xs text-slate-500">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 text-2xl">📦</div>
            <p className="text-xs font-bold text-slate-700">Chưa có sản phẩm nào</p>
            <p className="mt-1 text-[11px] text-slate-400">Bấm "Thêm mới" để bắt đầu.</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-2 py-6 text-center text-xs text-slate-500">
            Không có sản phẩm nào khớp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="w-20 px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700"
                  >
                    Ảnh
                  </th>
                  <SortHeader k="name">Tên</SortHeader>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700"
                  >
                    Danh mục
                  </th>
                  <SortHeader k="price" align="right">
                    Giá
                  </SortHeader>
                  <SortHeader k="stock" align="right">
                    Kho
                  </SortHeader>
                  <SortHeader k="sales" align="right">
                    Đã bán
                  </SortHeader>
                  <SortHeader k="order" align="right">
                    Thứ tự
                  </SortHeader>
                  <th
                    scope="col"
                    className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700"
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="w-28 px-2 py-2 text-right text-[11px] font-bold uppercase text-slate-700"
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((item) => {
                  const thumb = item.thumbnail || item.images?.[0];
                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50 ${item.isActive ? '' : 'opacity-60'}`}
                    >
                      <td className="px-2 py-2">
                        <div className="h-10 w-10 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-base text-slate-300">
                              📦
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.title}
                        </p>
                        {item.sellerName && (
                          <p className="mt-0.5 text-[10px] text-slate-500 line-clamp-1">
                            👤 {item.sellerName}
                            {item.sellerPhone ? ` · ${item.sellerPhone}` : ''}
                          </p>
                        )}
                        {item.isFeatured && (
                          <span className="mt-0.5 inline-block rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700">
                            ⭐ NỔI BẬT
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-slate-700">
                        {item.category?.name || (
                          <span className="text-slate-400">Chưa phân loại</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-right text-xs font-extrabold text-[#E60067]">
                        {item.price ? `${item.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                        {item.originalPrice > item.price && (
                          <div className="text-[10px] font-normal text-slate-400 line-through">
                            {item.originalPrice.toLocaleString('vi-VN')}₫
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 text-right text-xs">
                        <span
                          className={
                            item.stock > 0 ? 'text-slate-700' : 'text-red-600 font-bold'
                          }
                        >
                          {item.stock ?? 0}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-right text-xs text-slate-700">
                        {item.salesCount ?? 0}
                      </td>
                      <td className="px-2 py-2 text-right text-xs text-slate-700">
                        {item.order ?? 0}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span
                            className={[
                              'inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                              item.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500',
                            ].join(' ')}
                          >
                            {item.isActive ? 'Hiện' : 'Ẩn'}
                          </span>
                          <span
                            className={[
                              'inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                              item.isPublished
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700',
                            ].join(' ')}
                          >
                            {item.isPublished ? 'Công khai' : 'Nháp'}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setModal({ type: 'edit', product: item })}
                            className="rounded p-1 hover:bg-blue-50"
                            title="Sửa"
                          >
                            <EditIcon aria-hidden="true" className="h-3.5 w-3.5 text-blue-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="rounded p-1 hover:bg-red-50"
                            title="Xoá"
                          >
                            <TrashIcon
                              aria-hidden="true"
                              className="h-3.5 w-3.5 text-red-600"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ProductManagerModal
          product={modal.type === 'edit' ? modal.product : null}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
