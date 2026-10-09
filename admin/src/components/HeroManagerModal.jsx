import { useState } from 'react';
import { XIcon, ImageIcon } from './icons.jsx';

export default function HeroManagerModal({ hero, onClose, onSave, onDelete }) {
  const isEdit = Boolean(hero?._id);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    alt: hero?.alt || '',
    link: hero?.link || '',
    order: hero?.order ?? '',
    isActive: hero?.isActive ?? true,
    file: null,
  });

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isEdit && !form.file) return alert('Vui lòng chọn ảnh.');
    if (!form.alt.trim()) return alert('Vui lòng nhập mô tả ảnh (alt).');

    setUploading(true);
    try {
      const fd = new FormData();
      if (form.file) fd.append('image', form.file);
      fd.append('alt', form.alt.trim());
      if (form.link.trim()) fd.append('link', form.link.trim());
      if (form.order !== '') fd.append('order', form.order);
      fd.append('isActive', String(form.isActive));
      await onSave(fd);
      onClose();
    } catch (err) {
      alert(err?.response?.data?.error || 'Lưu thất bại.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Xoá hero "${form.alt}"?`)) return;
    try {
      await onDelete(hero._id);
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
      <div className="w-full max-w-sm rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-extrabold text-slate-900">
            {isEdit ? 'Sửa Hero' : 'Thêm Hero'}
          </h2>
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
          {/* Preview */}
          {(hero?.imageUrl || form.file) && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
              {form.file ? (
                <img
                  src={URL.createObjectURL(form.file)}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={hero.imageUrl}
                  alt={hero.alt || 'Hero'}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          )}

          {/* Upload */}
          {!isEdit && (
            <label className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <ImageIcon aria-hidden="true" className="h-6 w-6 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-600">
                {form.file ? form.file.name : 'Chọn ảnh'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => set('file', e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          )}

          {/* Alt */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Mô tả ảnh (alt) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.alt}
              onChange={(e) => set('alt', e.target.value)}
              placeholder="VD: Banner khóa học thu đông"
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
            />
          </div>

          {/* Link */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">
              Liên kết (tuỳ chọn)
            </label>
            <input
              type="text"
              value={form.link}
              onChange={(e) => set('link', e.target.value)}
              placeholder="VD: /courses/abc"
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
            />
          </div>

          {/* Order + Active */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Thứ tự
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => set('order', e.target.value)}
                min="0"
                placeholder="0"
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-1.5 pt-4 text-[11px] font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="h-3.5 w-3.5 accent-primary-600"
              />
              Hiển thị
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-100"
              >
                Xoá
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
              disabled={uploading}
              className="rounded-md bg-[#E60067] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#d0005a] disabled:opacity-50"
            >
              {uploading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
