import {
  StarIcon,
  ClockIcon,
  HeartIcon,
  HeartFillIcon,
  BookIcon,
} from '../icons/index.jsx';
import { resolveImageUrl } from '../../utils/imageUrl.js';

/**
 * Hero trang chi tiết khóa học.
 *
 * Bố cục 2 cột:
 *   - Cột trái : thẻ trắng chứa badge, tiêu đề, mô tả, meta, tiến độ.
 *   - Cột phải : khung ảnh bìa dùng object-contain (ảnh hiện ĐỦ, không bị cắt).
 *
 * Props:
 * - course         : object khóa học
 * - lessons        : array bài học (để hiển thị "N bài học")
 * - progressPct    : tiến độ 0-100 của người học
 * - completedCount : số bài đã hoàn thành
 * - isFavorite     : đã yêu thích chưa
 * - onToggleFavorite : callback khi bấm nút yêu thích
 */
export default function CourseDetailHero({
  course,
  lessons = [],
  progressPct = 0,
  completedCount = 0,
  isFavorite = false,
  onToggleFavorite,
}) {
  const rawImage = course?.coverUrl || course?.thumbnail || '';
  const heroImage = rawImage ? resolveImageUrl(rawImage) : '';
  const hasHeroImage = Boolean(heroImage);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
      {/* ─── Thông tin khóa học ─── */}
      <div className="order-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 lg:order-1">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {course?.isFeatured && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                  NỔI BẬT
                </span>
              )}
              {course?.videoId && (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                  CÓ VIDEO
                </span>
              )}
              {course?.category && (
                <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-[10px] font-bold text-[#E60067]">
                  {course.category}
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">
              {course?.title}
            </h1>
            {course?.description && (
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {course.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={
              isFavorite ? 'Bỏ yêu thích khóa học' : 'Yêu thích khóa học'
            }
            className="shrink-0 rounded-full border border-slate-200 bg-white p-2 text-slate-400 transition-colors hover:border-pink-200 hover:bg-pink-50 hover:text-[#E60067]"
          >
            {isFavorite ? (
              <HeartFillIcon aria-hidden="true" className="h-6 w-6 text-[#E60067]" />
            ) : (
              <HeartIcon aria-hidden="true" className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500">
          {course?.rating > 0 && (
            <div className="flex items-center gap-1 font-bold text-amber-500">
              <StarIcon
                aria-hidden="true"
                className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400"
              />
              <span>{Number(course.rating).toFixed(1)}</span>
            </div>
          )}
          {course?.durationMinutes > 0 && (
            <div className="flex items-center gap-1">
              <ClockIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatDuration(course.durationMinutes)}</span>
            </div>
          )}
          {lessons.length > 0 && (
            <div className="flex items-center gap-1">
              <BookIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
              <span>{lessons.length} bài học</span>
            </div>
          )}
        </div>

        {progressPct > 0 && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Tiến độ của bạn</span>
              <span className="font-extrabold text-teal-600">{progressPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {lessons.length > 0 && (
              <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                Đã hoàn thành {completedCount}/{lessons.length} bài học
              </p>
            )}
          </div>
        )}
      </div>

      {/* ─── Ảnh bìa ─── */}
      <div className="order-1 lg:order-2">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-pink-50 via-white to-slate-100 shadow-sm">
          {hasHeroImage ? (
            <div className="flex aspect-[4/3] w-full items-center justify-center p-3">
              <img
                src={heroImage}
                alt={course?.title || 'Ảnh bìa khóa học'}
                className="max-h-full max-w-full rounded-xl object-contain shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 text-slate-300">
              <BookIcon aria-hidden="true" className="h-10 w-10" />
              <span className="text-[11px] font-medium">Khóa học chưa có ảnh bìa</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Định dạng thời lượng phút → "2 Tiếng 30 Phút". */
function formatDuration(min) {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h} Tiếng ${m} Phút`;
  if (h > 0) return `${h} Tiếng`;
  return `${m} Phút`;
}
