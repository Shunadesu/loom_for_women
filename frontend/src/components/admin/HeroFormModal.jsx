import { useEffect, useState } from 'react';

const EMPTY = { alt: '', link: '', order: 0, isActive: true, imageUrl: '' };

export default function HeroFormModal({ open, initial, onClose, onSubmit, busy }) {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setFile(null);
    if (initial) {
      setForm({
        alt: initial.alt || '',
        link: initial.link || '',
        order: initial.order ?? 0,
        isActive: initial.isActive ?? true,
        imageUrl: initial.imageUrl || '',
      });
      setPreview(initial.imageUrl || '');
    } else {
      setForm(EMPTY);
      setPreview('');
    }
  }, [open, initial]);

  if (!open) return null;

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)) {
      setError('Chỉ chấp nhận file ảnh (jpg, png, webp, gif).');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Ảnh tối đa 5MB.');
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleChange(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!initial && !file) {
      setError('Vui lòng chọn ảnh.');
      return;
    }
    if (initial && !file && !initial.imageUrl) {
      setError('Thiếu ảnh.');
      return;
    }
    const fd = new FormData();
    if (file) fd.append('image', file);
    fd.append('alt', form.alt);
    fd.append('link', form.link);
    fd.append('order', String(form.order ?? 0));
    fd.append('isActive', String(form.isActive));
    onSubmit(fd);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-extrabold text-slate-900">
            {initial ? 'Sửa ảnh hero' : 'Thêm ảnh hero'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-4">
          {/* Preview */}
          <div className="flex justify-center">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-36 w-full rounded-xl border border-slate-100 object-cover"
              />
            ) : (
              <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
                Chưa có ảnh
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">
              File ảnh {initial && <span className="text-slate-400">(bỏ trống nếu giữ nguyên)</span>}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFile}
              className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white text-xs file:mr-3 file:rounded-l-lg file:border-0 file:bg-pink-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#E60067] hover:file:bg-pink-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Alt</label>
            <input
              type="text"
              value={form.alt}
              onChange={(e) => handleChange('alt', e.target.value)}
              placeholder="Mô tả ảnh (SEO)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#E60067] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Link (tuỳ chọn)</label>
            <input
              type="url"
              value={form.link}
              onChange={(e) => handleChange('link', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#E60067] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700">Thứ tự</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => handleChange('order', Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#E60067] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700">Trạng thái</label>
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(form.isActive)}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#E60067] focus:ring-[#E60067]"
                />
                Hiển thị
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#E60067] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#d0005a] disabled:opacity-60"
            >
              {busy ? 'Đang lưu…' : initial ? 'Lưu thay đổi' : 'Tạo ảnh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}