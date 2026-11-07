import {
  OA_DESCRIPTION,
  OA_LOGO_URL,
  OA_NAME,
} from '../../data/homeContent.js';

/**
 * OAFollowCard — thẻ theo dõi Official Account của Loom for Women.
 *
 * Bố cục ngang: logo + tên + mô tả bên trái, nút "Quan tâm OA" bên phải.
 * Trên mobile (sm trở xuống) bố cục xuống dòng, nút tự canh trái.
 */
export default function OAFollowCard() {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-pink-200 bg-white p-0.5 text-xs font-bold text-white shadow-xs">
          <img
            src={OA_LOGO_URL}
            alt="Logo"
            referrerPolicy="no-referrer"
            className="h-full w-full rounded-full object-contain"
          />
        </div>
        <div>
          <span className="block text-xs font-bold text-slate-900 sm:text-sm">
            {OA_NAME}
          </span>
          <p className="text-[11px] text-slate-500 sm:text-xs">
            {OA_DESCRIPTION}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="shrink-0 cursor-pointer self-start rounded-full bg-[#E60067] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#d0005a] sm:self-center"
      >
        Quan tâm OA
      </button>
    </div>
  );
}
