import { useEffect, useState } from 'react';
import { XIcon } from './icons.jsx';

const ICON_PRESETS = [
  '🛍️', '🧶', '🧵', '👗', '👜', '🧣', '🧤', '🧥',
  '👒', '👠', '💍', '🎀', '🪡', '🪢', '🌸', '🪻',
  '🍂', '🍁', '🕯️', '🧺', '🎨', '🪞', '☕', '🏺',
];

const blankForm = {
  name: '',
  icon: '🛍️',
  color: '#E60067',
  order: 0,
  isActive: true,
};

export default function ProductCategoryManagerModal({
  category,
  onClose,
  onSave,
  onDelete,
}) {
  const isEdit = Boolean(category?._id);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        icon: category.icon || '🛍️',
        color: category.color || '#E60067',
        order: category.order ?? 0,
        isActive: category.isActive ?? true,
      });
    } else {
      setForm(blankForm);
    }
  }, [category]);

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Vui lòng nhập tên danh mục.');

    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        icon: form.icon,
        color: form.color,
        order: Number(form.order) || 0,
        isActive: form.isActive,
      });
      onClose();
    } catch (err) {
      alert(err?.response?.data?.error || 'Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Xoá danh mục "${form.name}"?`)) return;
    try {
      await onDelete(category._id);
      onClose();
    } catch (err) {
      alert(err?.response?.data?.error || 'Xoá thất bại.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              {isEdit ? 'Sửa danh mục sản phẩm' : 'Thêm danh mục sản phẩm'}
            </h2>
            {isEdit && category?.slug && (
              <p className="mt-0.5 text-[10px] text-slate-500">/{category.slug}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <XIcon aria-hidden="true" className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Tên */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              maxLength={80}
              placeholder="VD: Phụ kiện, Thời trang, Đồ gia dụng…"
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
              autoFocus
            />
          </div>

          {/* Icon */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Icon
            </label>
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-lg"
                style={{ backgroundColor: `${form.color}1A` }}
              >
                {form.icon}
              </div>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => set('icon', e.target.value)}
                maxLength={8}
                className="w-20 rounded-md border border-slate-300 px-2.5 py-1.5 text-center text-xs focus:border-[#E60067] focus:outline-none"
                placeholder="🛍️"
              />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {ICON_PRESETS.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => set('icon', emo)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md border text-base transition-colors ${
                    form.icon === emo
                      ? 'border-[#E60067] bg-pink-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  title={emo}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          {/* Màu */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Màu sắc
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                className="h-8 w-12 cursor-pointer rounded border border-slate-300"
              />
              <input
                type="text"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
                placeholder="#E60067"
              />
            </div>
          </div>

          {/* Thứ tự + Active */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => set('order', e.target.value)}
                min="0"
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#E60067]"
                />
                Đang hiển thị
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 border-t border-slate-200 pt-3">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-100"
              >
                🗑 Xoá
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-[#E60067] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-[#d0005a] disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
