import {
  OA_DESCRIPTION,
  OA_LOGO_URL,
  OA_NAME,
} from '../../data/homeContent.js';

export default function OAFollowCard() {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs">
      <p className="text-[11px] leading-snug text-slate-600">{OA_DESCRIPTION}</p>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-pink-200 bg-white p-0.5 shadow-xs">
            <img
              src={OA_LOGO_URL}
              alt="Logo"
              referrerPolicy="no-referrer"
              className="h-full w-full rounded-full object-contain"
            />
          </div>
          <span className="text-xs font-bold text-slate-900">{OA_NAME}</span>
        </div>
        <button
          type="button"
          className="rounded-full bg-[#E60067] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#d0005a]"
        >
          Quan tâm
        </button>
      </div>
    </div>
  );
}