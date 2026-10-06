import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgressStore } from '../../store/progressStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { PlayIcon, ClockIcon, ChevronRightIcon } from '../icons/index.jsx';

/**
 * Banner "Tiếp tục học" — hiển thị khóa học user đang học dở gần nhất.
 * - Nguồn: GET /api/progress/me/continue
 * - Ẩn nếu chưa đăng nhập hoặc không có course ongoing.
 */
export default function ContinueLearningBanner() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = Boolean(token || user?._id);
  const continueItem = useProgressStore((s) => s.continueItem);
  const fetchContinue = useProgressStore((s) => s.fetchContinue);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContinue();
    }
  }, [isAuthenticated, fetchContinue]);

  if (!isAuthenticated || !continueItem) return null;

  const { slug, title, thumbnail, category, progressPct, lessonsCount, durationMinutes } =
    continueItem;
  const detailLink = `/khoa-hoc/${slug}`;
  const categoryColor = category?.color || '#E60067';
  const categoryName = category?.name || '';

  return (
    <div className="overflow-hidden rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 via-white to-pink-50 p-3 shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="inline-block rounded-full bg-[#E60067] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-xs">
            Tiếp tục học
          </span>
          {categoryName && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryName}
            </span>
          )}
        </div>
        <Link
          to="/khoa-hoc?tab=ongoing"
          className="flex items-center gap-0.5 text-[10px] font-bold text-slate-500 hover:text-[#E60067]"
        >
          Tất cả
          <ChevronRightIcon aria-hidden="true" className="h-3 w-3" />
        </Link>
      </div>

      <Link
        to={detailLink}
        className="group flex items-center gap-3"
        title="Mở khóa học"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {thumbnail ? (
            <img
              alt={title}
              src={thumbnail}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-slate-300">
              📚
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-90 transition-opacity group-hover:opacity-100">
            <PlayIcon aria-hidden="true" className="h-5 w-5 text-white drop-shadow" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-xs font-extrabold text-slate-900 group-hover:text-[#E60067]">
            {title}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-[10px] font-medium text-slate-500">
            {lessonsCount > 0 && <span>{lessonsCount} bài học</span>}
            {lessonsCount > 0 && durationMinutes > 0 && <span className="text-slate-300">·</span>}
            {durationMinutes > 0 && (
              <span className="flex items-center gap-0.5">
                <ClockIcon aria-hidden="true" className="h-2.5 w-2.5" />
                {formatDuration(durationMinutes)}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-500 transition-all duration-500"
                style={{ width: `${progressPct || 0}%` }}
              />
            </div>
            <span className="text-[10px] font-extrabold text-teal-600">
              {progressPct || 0}%
            </span>
          </div>
        </div>

        <button
          type="button"
          className="shrink-0 rounded-full bg-[#E60067] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs transition-colors hover:bg-[#d0005a]"
        >
          Học tiếp
        </button>
      </Link>
    </div>
  );
}

function formatDuration(min) {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h} Tiếng ${m} Phút`;
  if (h > 0) return `${h} Tiếng`;
  return `${m} Phút`;
}
