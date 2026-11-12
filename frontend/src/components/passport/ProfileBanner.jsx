import { useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { usePassportStore } from '../../store/passportStore.js';
import { useLoginDrawerStore } from '../../store/loginDrawerStore.js';
import { CameraIcon } from '../icons/index.jsx';
import { resolveImageUrl } from '../../utils/imageUrl.js';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function formatPhoneDisplay(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone || '';
}

export default function ProfileBanner() {
  const passport = usePassportStore((s) => s.passport);
  const user = useAuthStore((s) => s.user);
  const points = useAuthStore((s) => s.points);
  const level = useAuthStore((s) => s.level);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const updateAvatar = useAuthStore((s) => s.updateAvatar);
  const openLoginDrawer = useLoginDrawerStore((s) => s.openLoginDrawer);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const profile = passport?.profile || {};
  const name = profile.name || user?.name || 'Bạn của Loom';
  const phone = formatPhoneDisplay(profile.phone || user?.phone);
  const location = profile.location || user?.location || 'KCN PouYuen';
  const occupation = user?.occupation ? ` (${user.occupation})` : '';
  const rawAvatar = profile.avatar || user?.avatar || FALLBACK_AVATAR;
  const avatar = rawAvatar ? resolveImageUrl(rawAvatar) : FALLBACK_AVATAR;
  const zaloVerified = profile.zaloVerified ?? true;

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAvatarError('Chỉ chấp nhận ảnh jpg, png, webp, gif.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Ảnh tối đa 3MB, vui lòng chọn ảnh nhỏ hơn.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      await updateAvatar(file);
    } catch (err) {
      setAvatarError(
        err?.response?.data?.error || 'Đổi ảnh đại diện thất bại, vui lòng thử lại.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-rose-600 via-[#E60067] to-pink-500 p-4 text-white shadow-md sm:p-5">
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <img
            alt={name}
            className="h-14 w-14 rounded-full border-2 border-white/80 object-cover shadow-md sm:h-16 sm:w-16"
            src={avatar}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_AVATAR;
            }}
          />
          {isAuthenticated && (
            <>
              <button
                type="button"
                title={uploading ? 'Đang tải ảnh lên...' : 'Đổi ảnh đại diện'}
                aria-label="Đổi ảnh đại diện"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -left-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-900/80 text-white shadow-xs transition-all hover:bg-slate-900 disabled:cursor-wait disabled:opacity-70"
              >
                <CameraIcon
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 ${uploading ? 'animate-pulse' : ''}`}
                />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </>
          )}
          {zaloVerified && (
            <span
              title="Đã xác thực"
              className="absolute -bottom-1 -right-1 rounded-full bg-emerald-400 p-0.5 text-[10px] font-bold text-slate-950 shadow-xs"
            >
              ✓
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black text-white sm:text-lg">{name}</h2>
            {zaloVerified && (
              <span className="flex items-center gap-1 rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                  <path d="m16 11 2 2 4-4" />
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                Zalo Verified
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-pink-100">
            {phone}{phone && ' • '}{location}{occupation}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-md bg-yellow-400 px-2.5 py-0.5 text-[10px] font-black text-slate-950 shadow-xs">
              ★ {Number(points || 0).toLocaleString('vi-VN')} Điểm An Sinh
            </span>
            <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              🛡️ Cấp {level || 1}: An Toàn Số
            </span>
          </div>
          {avatarError && (
            <p className="mt-1 text-[10px] font-semibold text-yellow-200">{avatarError}</p>
          )}
        </div>
      </div>
      {isAuthenticated ? (
        <button
          type="button"
          onClick={() => logout()}
          className="cursor-pointer whitespace-nowrap rounded-xl border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/25"
        >
          Đăng xuất
        </button>
      ) : (
        <button
          type="button"
          onClick={() => openLoginDrawer('/he-chieu')}
          className="cursor-pointer whitespace-nowrap rounded-xl border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/25"
        >
          Đăng nhập / Đổi tài khoản
        </button>
      )}
    </div>
  );
}
