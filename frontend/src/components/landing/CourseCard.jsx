import { Link } from 'react-router-dom';
import { PlayIcon, StarIcon, ClockIcon } from '../icons/index.jsx';
import CourseProgressButton from './CourseProgressButton.jsx';
import { resolveImageUrl } from '../../utils/imageUrl.js';

/**
 * Card khóa học — dùng cho cả list + featured.
 * Props:
 *   - course: { _id, title, slug, thumbnail, category, rating, durationMinutes, progressPct, lessonsCount, lastLessonId }
 *   - onProgressClick: bấm nút progress (default navigate detail)
 *   - onImageClick: click vào vùng thumbnail
 */
export default function CourseCard({ course, onProgressClick, onImageClick }) {
  const categoryName = course.category?.name || 'Khác';
  const categoryColor = course.category?.color || '#E60067';

  // Nếu user đang học dở → deep-link tới đúng bài đó
  const detailHref = course.lastLessonId
    ? `/khoa-hoc/${course.slug}?lesson=${course.lastLessonId}`
    : `/khoa-hoc/${course.slug}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition-all hover:border-pink-200 sm:flex-row">
      {/* Thumbnail */}
      <div className="relative h-28 w-full shrink-0 overflow-hidden bg-slate-100 sm:h-28 sm:w-28">
        <Link to={detailHref} className="block h-full w-full">
          <img
            alt={course.title}
            src={resolveImageUrl(course.thumbnail)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-90 transition-opacity hover:opacity-100"
            onClick={(e) => {
              if (onImageClick) {
                e.preventDefault();
                onImageClick();
              }
            }}
          >
            <PlayIcon
              aria-hidden="true"
              className="h-8 w-8 text-white drop-shadow-md"
            />
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <div className="mb-1 flex items-center justify-between gap-1">
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryName}
            </span>
            {course.isFeatured && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                NỔI BẬT
              </span>
            )}
          </div>

          <Link to={detailHref}>
            <h3 className="line-clamp-2 cursor-pointer text-xs font-bold text-slate-900 hover:text-[#E60067]">
              {course.title}
            </h3>
          </Link>

          <div className="mt-1.5 flex items-center gap-3 text-[11px] font-medium text-slate-500">
            {course.rating > 0 && (
              <div className="flex items-center gap-1 font-bold text-amber-500">
                <StarIcon
                  aria-hidden="true"
                  className="h-3 w-3 fill-amber-400 stroke-amber-400"
                />
                <span>{Number(course.rating).toFixed(1)}</span>
              </div>
            )}
            {course.rating > 0 && <span className="text-slate-300">|</span>}
            {course.durationMinutes > 0 && (
              <div className="flex items-center gap-1">
                <ClockIcon
                  aria-hidden="true"
                  className="h-3 w-3 text-slate-400"
                />
                <span>{formatDuration(course.durationMinutes)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2">
          <CourseProgressButton
            progressPct={course.progressPct || 0}
            onClick={() => onProgressClick?.(course)}
          />
          {course.lessonsCount > 0 && (
            <span className="text-[10px] text-slate-400">
              {course.lessonsCount} bài
            </span>
          )}
        </div>
      </div>
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