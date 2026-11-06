import { useEffect, useRef, useState } from 'react';
import { fetchConfig, uploadLogo, deleteLogo } from '../services/configApi.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import { ImageIcon, TrashIcon, PlusIcon } from '../components/icons.jsx';
import { useNotification } from '../store/notificationStore.js';

const DEFAULT_LOGO = '/logo.png';
const MAX_SIZE = 3 * 1024 * 1024; // 3MB — khớp giới hạn backend
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function LogoManager() {
  const { notify } = useNotification();
  const fileInputRef = useRef(null);

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchConfig()
      .then((c) => {
        if (alive) {
          setConfig(c);
          setError(null);
        }
      })
      .catch((err) => {
        if (alive) {
          setError(err?.response?.data?.error || 'Không tải được cấu hình.');
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Dọn object URL khi đổi file
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const currentLogo = config?.logoUrl || '';
  const currentSrc = currentLogo ? resolveImageUrl(currentLogo) : DEFAULT_LOGO;

  function handlePick(e) {
    const picked = e.target.files?.[0] || null;
    setError(null);
    if (!picked) return;

    if (!ACCEPTED.includes(picked.type)) {
      setError('Chỉ chấp nhận file ảnh (jpg, png, webp, gif).');
      setFile(null);
      e.target.value = '';
      return;
    }
    if (picked.size > MAX_SIZE) {
      setError('Kích thước ảnh tối đa 3MB.');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(picked);
  }

  async function handleUpload() {
    if (!file) {
      notify({ type: 'warning', title: 'Chưa chọn ảnh', message: 'Vui lòng chọn file logo.' });
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const next = await uploadLogo(file);
      setConfig(next);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      notify({ type: 'success', title: 'Thành công', message: 'Logo đã được cập nhật.' });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Tải logo lên thất bại.';
      setError(msg);
      notify({ type: 'error', title: 'Thất bại', message: msg });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Xoá logo hiện tại? Website sẽ dùng lại logo mặc định (/logo.png).')) return;
    setUploading(true);
    setError(null);
    try {
      const next = await deleteLogo();
      setConfig(next);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      notify({ type: 'success', title: 'Thành công', message: 'Đã xoá logo, dùng lại logo mặc định.' });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Xoá logo thất bại.';
      setError(msg);
      notify({ type: 'error', title: 'Thất bại', message: msg });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-slate-900">Logo &amp; Thương hiệu</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Ảnh dùng chung cho header, footer, popup đăng ký, popup welcome và favicon của website.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {/* Logo hiện tại */}
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h2 className="mb-2 text-[11px] font-bold uppercase text-slate-700">
            Logo đang dùng
          </h2>
          <div className="flex h-32 items-center justify-center rounded-lg bg-slate-50 p-3">
            {loading ? (
              <span className="text-xs text-slate-400">Đang tải...</span>
            ) : (
              <img
                src={currentSrc}
                alt={config?.logoAlt || 'Logo Loom for Women'}
                className="max-h-24 max-w-full object-contain"
              />
            )}
          </div>
          <p className="mt-2 break-all text-[10px] text-slate-400">
            {currentLogo ? `Nguồn: ${currentLogo}` : 'Đang dùng logo mặc định (/logo.png)'}
          </p>
          {currentLogo && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={uploading}
              className="mt-2 flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              <TrashIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Xoá logo
            </button>
          )}
        </div>

        {/* Upload */}
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h2 className="mb-2 text-[11px] font-bold uppercase text-slate-700">
            Tải logo mới
          </h2>

          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 transition-colors hover:border-primary-400 hover:bg-primary-50">
            <ImageIcon aria-hidden="true" className="h-6 w-6 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-600">
              {file ? file.name : 'Chọn ảnh logo'}
            </span>
            <span className="text-[10px] text-slate-400">
              JPG / PNG / WEBP / GIF — tối đa 3MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePick}
              className="hidden"
            />
          </label>

          {preview && (
            <div className="mt-2 flex h-24 items-center justify-center rounded-lg bg-slate-50 p-2">
              <img src={preview} alt="Xem trước" className="max-h-20 max-w-full object-contain" />
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !file}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-md bg-[#E60067] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-[#d0005a] disabled:opacity-50"
          >
            <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
            {uploading ? 'Đang tải lên...' : 'Tải logo lên'}
          </button>
        </div>
      </div>
    </div>
  );
}
