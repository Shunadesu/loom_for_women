import { useEffect, useMemo, useState } from 'react';
import { useProductStore } from '../store/productStore.js';
import ProductCategoryManagerModal from '../components/ProductCategoryManagerModal.jsx';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '../components/icons.jsx';
import { useNotification } from '../store/notificationStore.js';

const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name, 'vi'),
  order: (a, b) => (a.order ?? 0) - (b.order ?? 0),
  created: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
};

export default function ProductCategoryManager() {
  const categories = useProductStore((s) => s.categories);
  const error = useProductStore((s) => s.error);
  const fetchCategories = useProductStore((s) => s.fetchCategories);
  const createCategory = useProductStore((s) => s.createCategory);
  const updateCategory = useProductStore((s) => s.updateCategory);
  const removeCategory = useProductStore((s) => s.removeCategory);
  const reorderCategories = useProductStore((s) => s.reorderCategories);

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [sortKey, setSortKey] = useState('order');
  const [sortDir, setSortDir] = useState('asc');
  const [modal, setModal] = useState(null); // null | { type: 'add' } | { type: 'edit', category }
  const { notify } = useNotification();

  useEffect(() => {
    loadAll();
  }, [fetchCategories]);

  async function loadAll() {
    setLoading(true);
    try {
      await fetchCategories();
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter((c) => {
      if (q) {
        const hay = `${c.name || ''} ${c.slug || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter === 'active' && !c.isActive) return false;
      if (statusFilter === 'inactive' && c.isActive) return false;
      return true;
    });
  }, [categories, query, statusFilter]);

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

  async function handleSave(payload) {
    if (modal?.type === 'edit' && modal.category) {
      await updateCategory(modal.category._id, payload);
    } else {
      await createCategory(payload);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Xoá danh mục "${item.name}"?`)) return;
    try {
      await removeCategory(item._id);
    } catch (err) {
      notify({ type: 'error', title: 'Xoá thất bại', message: err?.response?.data?.error || 'Xoá thất bại.' });
    }
  }

  async function handleMoveUp(index) {
    if (index === 0) return;
    const newItems = [...sorted];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    await saveOrder(newItems);
  }

  async function handleMoveDown(index) {
    if (index === sorted.length - 1) return;
    const newItems = [...sorted];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    await saveOrder(newItems);
  }

  async function saveOrder(newItems) {
    const payload = newItems.map((c, i) => ({ id: c._id, order: i }));
    try {
      await reorderCategories(payload);
    } catch (err) {
      notify({ type: 'error', title: 'Sắp xếp thất bại', message: 'Không sắp xếp được.' });
      loadAll();
    }
  }

  const hasFilter = query || statusFilter !== 'all';

  function clearFilters() {
    setQuery('');
    setStatusFilter('all');
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-slate-900">
            Quản lý Danh mục Sản phẩm
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Tổng {categories.length} · đang hiển thị {sorted.length}
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
          <div className="relative min-w-[200px] flex-1">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc slug…"
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-7 pr-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#E60067] focus:outline-none focus:ring-1 focus:ring-[#E60067]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ml-auto rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-[#E60067] focus:outline-none"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="inactive">Đã ẩn</option>
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
        {loading && categories.length === 0 ? (
          <div className="px-2 py-6 text-center text-xs text-slate-500">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 text-2xl">🛍️</div>
            <p className="text-xs font-bold text-slate-700">Chưa có danh mục nào</p>
            <p className="mt-1 text-[11px] text-slate-400">Bấm "Thêm mới" để bắt đầu.</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-2 py-6 text-center text-xs text-slate-500">
            Không có danh mục nào khớp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="w-20 px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700"
                  >
                    Icon
                  </th>
                  <SortHeader k="name">Tên</SortHeader>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700"
                  >
                    Slug
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700"
                  >
                    Màu
                  </th>
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
                    className="w-40 px-2 py-2 text-right text-[11px] font-bold uppercase text-slate-700"
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((item, i) => (
                  <tr
                    key={item._id}
                    className={`hover:bg-slate-50 ${item.isActive ? '' : 'opacity-60'}`}
                  >
                    <td className="px-2 py-2">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-lg"
                        style={{ backgroundColor: `${item.color}1A` }}
                      >
                        {item.icon || '🛍️'}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                    </td>
                    <td className="px-2 py-2 text-[11px] text-slate-500">
                      {item.slug}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-3.5 w-3.5 rounded-full border border-slate-200"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[10px] text-slate-500">{item.color}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right text-xs text-slate-700">
                      {item.order ?? 0}
                    </td>
                    <td className="px-2 py-2 text-center">
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
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(i)}
                          disabled={i === 0}
                          className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                          title="Lên"
                        >
                          <ArrowUpIcon
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-slate-600"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(i)}
                          disabled={i === sorted.length - 1}
                          className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                          title="Xuống"
                        >
                          <ArrowDownIcon
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-slate-600"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal({ type: 'edit', category: item })}
                          className="rounded p-1 hover:bg-blue-50"
                          title="Sửa"
                        >
                          <EditIcon
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-blue-600"
                          />
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ProductCategoryManagerModal
          category={modal.type === 'edit' ? modal.category : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
