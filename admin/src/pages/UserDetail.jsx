import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getUserAdmin,
  deleteUserAdmin,
} from '../services/userApi.js';
import {
  ArrowLeftIcon,
  TrashIcon,
  AwardIcon,
  CheckIcon,
  XIcon,
  ImageIcon,
} from '../components/icons.jsx';

// Map key tier → class Tailwind (đồng bộ UserManager).
const TIER_STYLES = {
  newcomer: {
    label: 'Mới',
    badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    hero: 'bg-slate-50 ring-slate-200 text-slate-700',
    bar: 'bg-slate-400',
  },
  silver: {
    label: 'Bạc',
    badge: 'bg-slate-200 text-slate-800 ring-1 ring-slate-300',
    hero: 'bg-slate-100 ring-slate-300 text-slate-800',
    bar: 'bg-slate-500',
  },
  gold: {
    label: 'Vàng',
    badge: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    hero: 'bg-amber-50 ring-amber-200 text-amber-800',
    bar: 'bg-amber-500',
  },
  platinum: {
    label: 'Bạch kim',
    badge: 'bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200',
    hero: 'bg-cyan-50 ring-cyan-200 text-cyan-800',
    bar: 'bg-cyan-500',
  },
};

const POINT_TYPE_LABELS = {
  lesson_complete: 'Hoàn thành bài học',
  course_finish: 'Hoàn thành khóa học',
  comment: 'Bình luận',
  admin_award: 'Thưởng từ admin',
  spent: 'Đã dùng',
};

function TierDisplay({ tier, points }) {
  if (!tier) {
    return (
      <div className="text-xs text-slate-500">
        Chưa có dữ liệu điểm.
      </div>
    );
  }
  const style = TIER_STYLES[tier.key] || TIER_STYLES.newcomer;
  return (
    <div className={`rounded-xl p-3 ring-1 ${style.hero}`}>
      <div className="flex items-center gap-2">
        <AwardIcon aria-hidden="true" className="h-4 w-4" />
        <span className="text-xs font-extrabold uppercase tracking-wide">
          {style.label}
        </span>
      </div>
      <p className="mt-1 text-2xl font-black leading-tight">
        {(points || 0).toLocaleString('vi-VN')}
        <span className="ml-1 text-xs font-bold opacity-60">điểm</span>
      </p>
      <p className="mt-0.5 text-[10px] opacity-70">
        Ngưỡng: {tier.min} –{' '}
        {Number.isFinite(tier.max) ? tier.max : '∞'}
      </p>
    </div>
  );
}

function formatDateTime(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec} giây trước`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} giờ trước`;
  const day = Math.round(h / 24);
  if (day < 30) return `${day} ngày trước`;
  return formatDateTime(dateString);
}

function StatCard({ label, value, color = 'slate', icon = null }) {
  const colorMap = {
    slate: 'text-slate-700',
    pink: 'text-pink-700',
    amber: 'text-amber-700',
    emerald: 'text-emerald-700',
    cyan: 'text-cyan-700',
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        {icon}
      </div>
      <p className={`mt-1 text-xl font-black ${colorMap[color] || colorMap.slate}`}>
        {value}
      </p>
    </div>
  );
}

export default function UserDetail() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadUser() {
    setLoading(true);
    setNotFound(false);
    try {
      const { user: u, summary: s } = await getUserAdmin(userId);
      setUser(u);
      setSummary(s);
    } catch (err) {
      if (err?.response?.status === 404) {
        setNotFound(true);
        setUser(null);
        setSummary(null);
      } else {
        const msg = err?.response?.data?.error || 'Không tải được người dùng.';
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    if (
      !window.confirm(
        `Xoá người dùng "${user.name || user.phone}"? Hành động này không thể hoàn tác.`
      )
    )
      return;
    try {
      await deleteUserAdmin(user._id);
      navigate('/admin/users');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Xoá thất bại.';
      alert(msg);
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-pink-500" />
        <p className="mt-2 text-xs text-slate-500">Đang tải chi tiết người dùng…</p>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <XIcon aria-hidden="true" className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-base font-extrabold text-slate-900">
          Không tìm thấy người dùng
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Có thể liên kết đã hết hạn hoặc tài khoản đã bị xoá.
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="mt-4 inline-flex items-center gap-1 rounded-md bg-pink-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-700"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const displayName = user.name || user.phone || 'Người dùng';
  const initials = displayName.charAt(0).toUpperCase();
  const tier = summary?.tier;
  const progressList = summary?.progress || [];
  const transactions = summary?.recentTransactions || [];

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
          Quay lại danh sách
        </button>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
            ID: {String(user._id).slice(-8)}
          </span>
          {user.passportSerial && (
            <span className="rounded bg-pink-50 px-2 py-0.5 font-bold text-pink-700">
              {user.passportSerial}
            </span>
          )}
        </div>
      </div>

      {/* Hero card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: avatar + identity */}
          <div className="border-b border-slate-200 bg-gradient-to-br from-pink-50 via-white to-slate-50 p-5 lg:col-span-4 lg:border-b-0 lg:border-r">
            <div className="flex items-start gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-full border-4 border-white object-cover shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-2xl font-black text-slate-500 shadow-md">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-extrabold text-slate-900">
                  {displayName}
                </h2>
                <p className="font-mono text-xs text-slate-600">{user.phone}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {user.zaloVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckIcon aria-hidden="true" className="h-3 w-3" />
                      Zalo xác thực
                    </span>
                  )}
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700">
                      Admin
                    </span>
                  )}
                  {!user.isActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Đã vô hiệu
                    </span>
                  )}
                </div>
                {Array.isArray(user.badges) && user.badges.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {user.badges.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 ring-1 ring-teal-200"
                      >
                        🏅 {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Extra info */}
            <div className="mt-4 space-y-1.5 text-[11px] text-slate-600">
              {user.location && (
                <p>
                  <span className="font-bold text-slate-700">📍 Khu vực:</span>{' '}
                  {user.location}
                </p>
              )}
              <p>
                <span className="font-bold text-slate-700">📅 Tạo:</span>{' '}
                {formatDateTime(user.createdAt)}
              </p>
              <p>
                <span className="font-bold text-slate-700">🔐 Đăng nhập cuối:</span>{' '}
                {user.lastLoginAt ? timeAgo(user.lastLoginAt) : '—'}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled
                title="Sắp có"
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500 opacity-60"
              >
                Đăng xuất thiết bị khác
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-red-700"
              >
                <TrashIcon aria-hidden="true" className="h-3.5 w-3.5" />
                Xoá người dùng
              </button>
            </div>
          </div>

          {/* Right: tier + meta */}
          <div className="p-5 lg:col-span-8">
            <div className="grid grid-cols-2 gap-3">
              <TierDisplay tier={tier} points={summary?.points} />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">Vai trò</p>
                  <p className="mt-1 text-sm font-extrabold capitalize text-slate-800">
                    {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">Trạng thái</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-800">
                    {user.isActive ? 'Đang hoạt động' : 'Đã vô hiệu'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">Hộ chiếu</p>
                  <p className="mt-1 font-mono text-sm font-extrabold text-slate-800">
                    {user.passportSerial || '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">Ngày tạo</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-800">
                    {formatDateTime(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-7">
        <StatCard
          label="Tổng điểm"
          value={(summary?.points || 0).toLocaleString('vi-VN')}
          color="pink"
        />
        <StatCard
          label="Đang học"
          value={summary?.coursesInProgress || 0}
          color="amber"
        />
        <StatCard
          label="Hoàn thành"
          value={summary?.coursesCompleted || 0}
          color="emerald"
        />
        <StatCard
          label="Chứng chỉ"
          value={summary?.certificatesCount || 0}
          color="cyan"
        />
        <StatCard
          label="Đơn hàng"
          value={summary?.ordersCount || 0}
        />
        <StatCard
          label="Bình luận"
          value={summary?.commentsCount || 0}
        />
        <StatCard
          label="Yêu thích"
          value={summary?.favoritesCount || 0}
        />
      </div>

      {/* Progress + Recent transactions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Khóa học đang theo (3/5) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-3">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Khóa học đang theo
            </h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              {progressList.length} khóa
            </span>
          </header>

          {progressList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
              Người dùng chưa đăng ký khóa học nào.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {progressList.map((p) => {
                const pct = Math.max(0, Math.min(100, p.progressPct || 0));
                const done = pct >= 100;
                const style = TIER_STYLES[tier?.key] || TIER_STYLES.newcomer;
                return (
                  <li
                    key={p.courseId || `${p.course?.title}-${p.updatedAt}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5"
                  >
                    {p.course?.thumbnail ? (
                      <img
                        src={p.course.thumbnail}
                        alt=""
                        className="h-14 w-20 shrink-0 rounded-md border border-slate-200 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-100 text-slate-400">
                        <ImageIcon aria-hidden="true" className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {p.course?.title || 'Khóa học đã bị xoá'}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full transition-all ${style.bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[10px] font-bold text-slate-700">
                          {pct}%
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                        <span>
                          {p.completedLessons || 0} bài hoàn thành
                        </span>
                        {p.lastWatchedAt && (
                          <>
                            <span>·</span>
                            <span>Học {timeAgo(p.lastWatchedAt)}</span>
                          </>
                        )}
                      </p>
                    </div>
                    {p.courseId && (
                      <Link
                        to={`/admin/courses/${p.courseId}/lessons`}
                        className="hidden shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-700 md:inline-block"
                      >
                        ↗ Mở khóa
                      </Link>
                    )}
                    {done && (
                      <span className="hidden shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 md:inline-block">
                        ✓ Hoàn thành
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Lịch sử điểm (2/5) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Lịch sử điểm
            </h3>
            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700">
              5 gần nhất
            </span>
          </header>

          {transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
              Chưa có giao dịch điểm nào.
            </div>
          ) : (
            <ul className="space-y-2">
              {transactions.map((tx) => {
                const positive = (tx.delta || 0) >= 0;
                return (
                  <li
                    key={tx._id}
                    className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5"
                  >
                    <span
                      className={`mt-0.5 inline-flex shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-xs font-black ${
                        positive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {positive ? '+' : ''}
                      {tx.delta}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-slate-900">
                        {POINT_TYPE_LABELS[tx.type] || tx.type}
                      </p>
                      {tx.description && (
                        <p className="truncate text-[10px] text-slate-500">
                          {tx.description}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        {timeAgo(tx.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
