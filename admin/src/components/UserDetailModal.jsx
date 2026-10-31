import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getUserAdmin,
} from '../services/userApi.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import {
  XIcon,
  AwardIcon,
  CheckIcon,
  ImageIcon,
} from './icons.jsx';
import { useNotification } from '../store/notificationStore.js';

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

function StatCard({ label, value, color = 'slate' }) {
  const colorMap = {
    slate: 'text-slate-700',
    pink: 'text-pink-700',
    amber: 'text-amber-700',
    emerald: 'text-emerald-700',
    cyan: 'text-cyan-700',
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
      <p className="text-[10px] font-medium text-slate-500">{label}</p>
      <p className={`mt-0.5 text-lg font-black ${colorMap[color] || colorMap.slate}`}>
        {value}
      </p>
    </div>
  );
}

function InfoCell({ label, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
      <p className="text-[10px] font-medium text-slate-500">{label}</p>
      <div className="mt-0.5 text-xs font-extrabold text-slate-800">{children}</div>
    </div>
  );
}

/**
 * Modal hiển thị thông tin chi tiết người dùng.
 * `user` là bản ghi từ danh sách (hiển thị ngay), phần summary được tải thêm từ API.
 */
export default function UserDetailModal({ user: listUser, onClose }) {
  const { notify } = useNotification();
  const userId = listUser?._id;
  const [detail, setDetail] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tải chi tiết + summary mỗi khi mở cho một user khác.
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    setDetail(null);
    setSummary(listUser?.summary || null);
    setLoading(true);
    getUserAdmin(userId)
      .then(({ user: u, summary: s }) => {
        if (cancelled) return;
        setDetail(u);
        setSummary(s);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err?.response?.data?.error || 'Không tải được chi tiết người dùng.';
        notify({ type: 'error', title: 'Tải dữ liệu thất bại', message: msg });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Đóng bằng phím Esc + khoá scroll nền khi modal mở.
  useEffect(() => {
    if (!userId) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [userId, onClose]);

  const user = detail || listUser;
  const displayName = user?.name || user?.phone || 'Người dùng';
  const initials = displayName.charAt(0).toUpperCase();
  const tier = summary?.tier;
  const tierStyle = TIER_STYLES[tier?.key] || TIER_STYLES.newcomer;
  const progressList = summary?.progress || [];
  const transactions = summary?.recentTransactions || [];

  return (
    <AnimatePresence>
      {listUser && (
        <motion.div
          key="user-detail-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-detail-title"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-slate-200 bg-gradient-to-br from-pink-50 via-white to-slate-50 p-4">
              {user.avatar ? (
                <img
                  src={resolveImageUrl(user.avatar)}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-full border-4 border-white object-cover shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-xl font-black text-slate-500 shadow-md">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2
                  id="user-detail-title"
                  className="truncate text-base font-extrabold text-slate-900"
                >
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
                    <span className="inline-flex items-center rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700">
                      Admin
                    </span>
                  )}
                  {!user.isActive && (
                    <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Đã vô hiệu
                    </span>
                  )}
                  {tier && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${tierStyle.badge}`}
                    >
                      ★ {tierStyle.label}
                    </span>
                  )}
                </div>
                {Array.isArray(user.badges) && user.badges.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
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
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
              >
                <XIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <InfoCell label="Vai trò">
                  {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </InfoCell>
                <InfoCell label="Trạng thái">
                  {user.isActive ? 'Đang hoạt động' : 'Đã vô hiệu'}
                </InfoCell>
                <InfoCell label="Hộ chiếu">
                  <span className="font-mono">{user.passportSerial || '—'}</span>
                </InfoCell>
                <InfoCell label="Khu vực">{user.location || '—'}</InfoCell>
                <InfoCell label="Ngày tạo">{formatDateTime(user.createdAt)}</InfoCell>
                <InfoCell label="Đăng nhập cuối">
                  {user.lastLoginAt ? timeAgo(user.lastLoginAt) : '—'}
                </InfoCell>
              </div>

              {/* Tier */}
              {tier && (
                <div className={`rounded-xl p-3 ring-1 ${tierStyle.hero}`}>
                  <div className="flex items-center gap-2">
                    <AwardIcon aria-hidden="true" className="h-4 w-4" />
                    <span className="text-xs font-extrabold uppercase tracking-wide">
                      {tierStyle.label}
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-black leading-tight">
                    {(summary?.points || 0).toLocaleString('vi-VN')}
                    <span className="ml-1 text-xs font-bold opacity-60">điểm</span>
                  </p>
                  <p className="mt-0.5 text-[10px] opacity-70">
                    Ngưỡng: {tier.min} – {Number.isFinite(tier.max) ? tier.max : '∞'}
                  </p>
                </div>
              )}

              {/* KPI */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <StatCard
                  label="Tổng điểm"
                  value={(summary?.points || 0).toLocaleString('vi-VN')}
                  color="pink"
                />
                <StatCard label="Đang học" value={summary?.coursesInProgress || 0} color="amber" />
                <StatCard label="Hoàn thành" value={summary?.coursesCompleted || 0} color="emerald" />
                <StatCard label="Chứng chỉ" value={summary?.certificatesCount || 0} color="cyan" />
                <StatCard label="Đơn hàng" value={summary?.ordersCount || 0} />
                <StatCard label="Bình luận" value={summary?.commentsCount || 0} />
                <StatCard label="Yêu thích" value={summary?.favoritesCount || 0} />
              </div>

              {loading && (
                <p className="text-center text-[11px] text-slate-400">
                  Đang tải thêm chi tiết…
                </p>
              )}

              {/* Courses */}
              <section>
                <header className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900">Khóa học đang theo</h3>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    {progressList.length} khóa
                  </span>
                </header>
                {progressList.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                    Người dùng chưa đăng ký khóa học nào.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {progressList.map((p) => {
                      const pct = Math.max(0, Math.min(100, p.progressPct || 0));
                      return (
                        <li
                          key={p.courseId || `${p.course?.title}-${p.updatedAt}`}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-2"
                        >
                          {p.course?.thumbnail ? (
                            <img
                              src={resolveImageUrl(p.course.thumbnail)}
                              alt=""
                              className="h-12 w-16 shrink-0 rounded-md border border-slate-200 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-100 text-slate-400">
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
                                  className={`h-full rounded-full ${tierStyle.bar}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="shrink-0 text-[10px] font-bold text-slate-700">
                                {pct}%
                              </span>
                            </div>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              {p.completedLessons || 0} bài hoàn thành
                              {p.lastWatchedAt && ` · Học ${timeAgo(p.lastWatchedAt)}`}
                            </p>
                          </div>
                          {pct >= 100 && (
                            <span className="hidden shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 sm:inline-block">
                              ✓ Hoàn thành
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Transactions */}
              <section>
                <header className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900">Lịch sử điểm</h3>
                  <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700">
                    5 gần nhất
                  </span>
                </header>
                {transactions.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                    Chưa có giao dịch điểm nào.
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {transactions.map((tx) => {
                      const positive = (tx.delta || 0) >= 0;
                      return (
                        <li
                          key={tx._id}
                          className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2"
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
                            <p className="text-[10px] text-slate-400">{timeAgo(tx.createdAt)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                ID: {String(user._id).slice(-8)}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/users/${user._id}`}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-700"
                >
                  Mở trang chi tiết
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md bg-pink-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
