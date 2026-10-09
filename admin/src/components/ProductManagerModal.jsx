import { useEffect, useState } from 'react';
import { XIcon, ImageIcon } from './icons.jsx';
import { toRelativeImageUrl } from '../utils/imageUrl.js';

const blankForm = {
  title: '',
  description: '',
  category: '',
  price: '',
  originalPrice: '',
  stock: 0,
  rating: 0,
  sellerName: '',
  sellerZaloUrl: '',
  isPublished: true,
  isFeatured: false,
  isActive: true,
  order: 0,
  file: null,
};

export default function ProductManagerModal({
  product,
  categories = [],
  onClose,
  onSave,
  onDelete,
}) {
  const isEdit = Boolean(product?._id);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        description: product.description || '',
        category: product.category?._id || product.category || '',
        price: product.price ?? '',
        originalPrice: product.originalPrice ?? '',
        stock: product.stock ?? 0,
        rating: product.rating ?? 0,
        sellerName: product.sellerName || '',
        sellerZaloUrl: product.sellerZaloUrl || '',
        isPublished: product.isPublished ?? true,
        isFeatured: product.isFeatured ?? false,
        isActive: product.isActive ?? true,
        order: product.order ?? 0,
        file: null,
      });
    } else {
      setForm(blankForm);
    }
  }, [product]);

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert('Vui lòng nhập tên sản phẩm.');
    if (form.price === '' || Number(form.price) < 0)
      return alert('Vui lòng nhập giá bán hợp lệ.');
    if (!isEdit && !form.file) {
      return alert('Vui lòng chọn ảnh thumbnail cho sản phẩm.');
    }

    setSaving(true);
    try {
      const fd = new FormData();
      if (form.file) fd.append('thumbnail', form.file);
      fd.append('title', form.title.trim());
      if (form.description) fd.append('description', form.description);
      if (form.category) fd.append('category', form.category);
      fd.append('price', String(Number(form.price) || 0));
      if (form.originalPrice !== '' && form.originalPrice !== null) {
        fd.append('originalPrice', String(Number(form.originalPrice) || 0));
      }
      fd.append('stock', String(Number(form.stock) || 0));
      fd.append('rating', String(Math.max(0, Math.min(5, Number(form.rating) || 0))));
      if (form.sellerName) fd.append('sellerName', form.sellerName);
      if (form.sellerZaloUrl) fd.append('sellerZaloUrl', form.sellerZaloUrl);
      fd.append('isPublished', String(form.isPublished));
      fd.append('isFeatured', String(form.isFeatured));
      fd.append('isActive', String(form.isActive));
      fd.append('order', String(Number(form.order) || 0));

      await onSave(fd, isEdit ? product._id : null);
      onClose();
    } catch (err) {
      alert(err?.response?.data?.error || 'Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Xoá sản phẩm "${form.title}"?`)) return;
    try {
      await onDelete(product._id);
      onClose();
    } catch (err) {
      alert(err?.response?.data?.error || 'Xoá thất bại.');
    }
  }

  const previewSrc = form.file
    ? URL.createObjectURL(form.file)
    : toRelativeImageUrl(product?.thumbnail || product?.images?.[0]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
            </h2>
            {isEdit && product?.slug && (
              <p className="mt-0.5 text-[10px] text-slate-500">/{product.slug}</p>
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
          {/* Ảnh thumbnail */}
          <section>
            <p className="mb-1.5 text-[11px] font-bold uppercase text-slate-700">
              Ảnh đại diện {!isEdit && <span className="text-red-500">*</span>}
            </p>
            <div className="flex gap-3">
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl text-slate-300">
                    📦
                  </div>
                )}
              </div>
              <label className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 cursor-pointer hover:border-[#E60067] hover:bg-pink-50 transition-colors">
                <ImageIcon aria-hidden="true" className="h-5 w-5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600 text-center">
                  {form.file
                    ? form.file.name
                    : isEdit
                    ? 'Bấm để thay ảnh (không bắt buộc)'
                    : 'Bấm để chọn ảnh'}
                </span>
                <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => set('file', e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* Thông tin cơ bản */}
          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase text-slate-700">
              Thông tin cơ bản
            </p>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="VD: Túi len móc thủ công"
                maxLength={200}
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Danh mục
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
                >
                  <option value="">— Chưa phân loại —</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
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
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Mô tả
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Mô tả chi tiết về sản phẩm…"
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
              />
              <p className="mt-0.5 text-right text-[10px] text-slate-400">
                {form.description.length}/2000
              </p>
            </div>
          </section>

          {/* Giá & kho */}
          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase text-slate-700">
              Giá &amp; kho
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Giá bán (₫) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  min="0"
                  step="1000"
                  placeholder="180000"
                  className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Giá gốc (₫)
                </label>
                <input
                  type="number"
                  value={form.originalPrice}
                  onChange={(e) => set('originalPrice', e.target.value)}
                  min="0"
                  step="1000"
                  placeholder="(tuỳ chọn)"
                  className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Tồn kho
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                  min="0"
                  className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Đánh giá (0–5)
                </label>
                <input
                  type="number"
                  value={form.rating}
                  onChange={(e) => set('rating', e.target.value)}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
                />
              </div>
            </div>
            {Number(form.originalPrice) > Number(form.price) && Number(form.price) > 0 && (
              <p className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">
                💡 Đang giảm{' '}
                {Math.round(
                  ((Number(form.originalPrice) - Number(form.price)) /
                    Number(form.originalPrice)) *
                    100
                )}
                % — sẽ hiển thị badge giảm giá ở frontend.
              </p>
            )}
          </section>

          {/* Người bán */}
          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase text-slate-700">
              Người bán (tuỳ chọn)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Tên người bán
                </label>
                <input
                  type="text"
                  value={form.sellerName}
                  onChange={(e) => set('sellerName', e.target.value)}
                  maxLength={100}
                  placeholder="Chị Hằng"
                  className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Link Zalo
                </label>
                <input
                  type="text"
                  value={form.sellerZaloUrl}
                  onChange={(e) => set('sellerZaloUrl', e.target.value)}
                  maxLength={500}
                  placeholder="https://zalo.me/..."
                  className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#E60067] focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Trạng thái */}
          <section className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
            <p className="mb-1.5 text-[11px] font-bold uppercase text-slate-700">
              Trạng thái
            </p>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#E60067]"
                />
                Đang hiển thị
              </label>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => set('isPublished', e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#E60067]"
                />
                Công khai
              </label>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => set('isFeatured', e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#E60067]"
                />
                ⭐ Nổi bật
              </label>
            </div>
          </section>

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
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
