import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCourses } from '../../services/courseApi.js';
import { PlayIcon, StarIcon, ClockIcon, ChevronRightIcon } from '../icons/index.jsx';

/**
 * Carousel ngang các khóa học nổi bật (isFeatured = true).
 * - Gọi GET /api/courses?featured=true
 * - Render scroll-snap ngang trên mobile.
 * - Ẩn nếu không có course nào.
 */
export default function FeaturedCarousel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchCourses({ featured: 'true', limit: 12 });
        if (mounted) setItems(data);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
          Khóa học nổi bật
        </h3>
        <Link
          to="/khoa-hoc?tab=ongoing"
          className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400 hover:text-[#E60067]"
        >
          Xem tất cả
          <ChevronRightIcon aria-hidden="true" className="h-3 w-3" />
        </Link>
      </div>

      <div className="-mx-3.5 flex gap-2.5 overflow-x-auto px-3.5 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-44 w-44 shrink-0 animate-pulse rounded-2xl bg-slate-100 sm:h-48 sm:w-48"
              />
            ))
          : items.map((c) => (
              <FeaturedCard key={c._id || c.slug} course={c} />
            ))}
      </div>
    </div>
  );
}

function FeaturedCard({ course }) {
  const categoryName = course.category?.name || 'Khác';
  const categoryColor = course.category?.color || '#E60067';

  return (
    <Link
      to={`/khoa-hoc/${course.slug}`}
      className="group relative block h-44 w-44 shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-xs transition-shadow hover:shadow-md sm:h-48 sm:w-48"
    >
      {course.thumbnail ? (
        <img
          alt={course.title}
          src={course.thumbnail}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl text-slate-300">
          📚
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute left-1.5 top-1.5">
        <span
          className="rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white shadow-xs"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryName}
        </span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-90 transition-opacity group-hover:opacity-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <PlayIcon aria-hidden="true" className="h-5 w-5 text-white drop-shadow" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-2 text-white">
        <h4 className="line-clamp-2 text-[11px] font-extrabold leading-tight">
          {course.title}
        </h4>
        <div className="mt-1 flex items-center gap-1.5 text-[9px] font-medium">
          {course.rating > 0 && (
            <span className="flex items-center gap-0.5 font-bold text-amber-300">
              <StarIcon aria-hidden="true" className="h-2.5 w-2.5 fill-amber-300 stroke-amber-300" />
              {Number(course.rating).toFixed(1)}
            </span>
          )}
          {course.durationMinutes > 0 && (
            <span className="flex items-center gap-0.5 text-white/80">
              <ClockIcon aria-hidden="true" className="h-2.5 w-2.5" />
              {formatDuration(course.durationMinutes)}
            </span>
          )}
        </div>
      </div>
    </Link>
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
