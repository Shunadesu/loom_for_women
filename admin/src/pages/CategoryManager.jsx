import { useEffect, useState } from 'react';
import {
  fetchAllCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  reorderCategoriesAdmin,
} from '../services/categoryApi.js';
import { PlusIcon, EditIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '../components/icons.jsx';
import { useNotification } from '../store/notificationStore.js';

export default function CategoryManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { notify } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchAllCategoriesAdmin();
      setItems(data);
    } catch (err) {
      notify({ type: 'error', title: 'Tải dữ liệu thất bại', message: 'Không tải được danh mục.' });
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function handleEdit(item) {
    setEditingItem(item);
    setModalOpen(true);
  }

  async function handleDelete(item) {
    if (!confirm(`Xoá "${item.name}"?`)) return;
    try {
      await deleteCategoryAdmin(item._id);
      setItems(items.filter((c) => c._id !== item._id));
    } catch (err) {
      notify({ type: 'error', title: 'Xoá thất bại', message: err?.response?.data?.error || 'Xoá thất bại.' });
    }
  }

  async function handleSave(payload) {
    try {
      if (editingItem) {
        const updated = await updateCategoryAdmin(editingItem._id, payload);
        setItems(items.map((c) => (c._id === updated._id ? updated : c)));
      } else {
        const created = await createCategoryAdmin(payload);
        setItems([...items, created]);
      }
      setModalOpen(false);
    } catch (err) {
      notify({ type: 'error', title: 'Lưu thất bại', message: err?.response?.data?.error || 'Lưu thất bại.' });
    }
  }

  async function handleMoveUp(index) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
    await saveOrder(newItems);
  }

  async function handleMoveDown(index) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
    await saveOrder(newItems);
  }

  async function saveOrder(newItems) {
    try {
      const payload = newItems.map((c, i) => ({ id: c._id, order: i }));
      await reorderCategoriesAdmin(payload);
    } catch (err) {
      notify({ type: 'error', title: 'Sắp xếp thất bại', message: 'Không sắp xếp được.' });
      loadData();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-extrabold text-slate-900">Quản lý Danh mục</h1>
        <button
          type="button"
          onClick={handleNew}
          className="flex items-center gap-1 rounded-md bg-primary-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary-700"
        >
          <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
          Thêm mới
        </button>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
          Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
          Chưa có danh mục nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Tên
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Slug
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Màu
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Active
                </th>
                <th className="px-2 py-2 text-right text-[11px] font-bold uppercase text-slate-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, i) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-2 py-2 text-xs font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-2 py-2 text-[11px] text-slate-500">{item.slug}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-3.5 w-3.5 rounded-full border border-slate-200"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] text-slate-500">{item.color}</span>
                    </div>
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
                      {item.isActive ? 'Active' : 'Hidden'}
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
                        <ArrowUpIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(i)}
                        disabled={i === items.length - 1}
                        className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                        title="Xuống"
                      >
                        <ArrowDownIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
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
                        <TrashIcon aria-hidden="true" className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <CategoryFormModal
          item={editingItem}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function CategoryFormModal({ item, onClose, onSave }) {
  const [name, setName] = useState(item?.name || '');
  const [color, setColor] = useState(item?.color || '#E60067');
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const { notify } = useNotification();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      notify({ type: 'warning', title: 'Thiếu thông tin', message: 'Tên không được trống.' });
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), color, isActive });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <h2 className="mb-3 text-sm font-extrabold text-slate-900">
          {item ? 'Sửa danh mục' : 'Thêm danh mục'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Tên danh mục
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
              placeholder="VD: Móc len cơ bản"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Màu sắc
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-12 cursor-pointer rounded border border-slate-300"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
                placeholder="#E60067"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="category-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300"
            />
            <label htmlFor="category-active" className="text-xs font-medium text-slate-700">
              Hiển thị (Active)
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-primary-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
