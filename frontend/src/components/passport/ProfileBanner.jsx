import { useAuthStore } from '../../store/authStore.js';
import { usePassportStore } from '../../store/passportStore.js';

export default function ProfileBanner() {
  const passport = usePassportStore((s) => s.passport);
  const points = useAuthStore((s) => s.points);

  if (!passport) return null;

  const { profile } = passport;

  return (
    <div className="bg-gradient-to-r from-rose-600 via-[#E60067] to-pink-500 rounded-2xl p-4 text-white shadow-md flex items-center gap-3">
      <div className="relative">
        <img
          alt={user?.name || 'User'}
          className="w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-md"
          src={profile.avatar}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
          }}
        />
        {profile.zaloVerified && (
          <span className="absolute -bottom-1 -right-1 bg-emerald-400 text-slate-950 text-[10px] p-0.5 rounded-full shadow-xs font-bold">
            ✓
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">{profile.name}</h2>
          {profile.zaloVerified && (
            <span className="bg-white/20 text-white font-semibold text-[9px] px-2 py-0.5 rounded-full border border-white/30">
              Zalo Verified
            </span>
          )}
        </div>
        <p className="text-[11px] text-pink-100">
          {profile.phone} • {profile.location}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="bg-yellow-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
            💎 {points} Loom Points
          </span>
        </div>
      </div>
    </div>
  );
}
