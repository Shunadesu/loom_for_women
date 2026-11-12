import { CheckCircleIcon, FlameIcon } from '../icons/index.jsx';
import { useCourseProgress } from '../../hooks/useCourseProgress.js';
import { useAuthStore } from '../../store/authStore.js';

/**
 * Badge trạng thái học tập cho thẻ khóa học.
 *
 * - ĐÃ HOÀN THÀNH (emerald): khóa học đã học xong 100%.
 * - ĐÃ HỌC (teal):            người dùng đã bắt đầu học nhưng chưa xong.
 * - Không hiện gì:            chưa đăng nhập hoặc chưa học khóa học nào.
 *
 * Props:
 *   - course: object khóa học (cần _id + progressPct)
 *   - variant:
 *       'inline'         → pill nhỏ dùng trong phần nội dung card
 *       'overlay'        → pill đè lên ảnh (dùng cho card ảnh lớn)
 *       'overlayCompact' → pill rút gọn (dùng cho thumbnail nhỏ)
 *   - className: class tuỳ biến thêm
 */
export default function CourseLearnedBadge({
  course,
  variant = 'inline',
  className = '',
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pct = useCourseProgress(course);

  // Khách (chưa đăng nhập) không có tiến trình → không hiện badge.
  if (!isAuthenticated || pct <= 0) return null;

  const completed = pct >= 100;
  const Icon = completed ? CheckCircleIcon : FlameIcon;

  if (variant === 'overlay') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide shadow-sm backdrop-blur-sm ${
          completed
            ? 'bg-emerald-500/95 text-white'
            : 'bg-white/95 text-teal-700'
        } ${className}`}
      >
        <Icon aria-hidden="true" className="h-3 w-3" />
        {completed ? 'Đã hoàn thành' : `Đã học ${pct}%`}
      </span>
    );
  }

  if (variant === 'overlayCompact') {
    return (
      <span
        title={completed ? 'Đã hoàn thành' : `Đã học ${pct}%`}
        className={`inline-flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-extrabold shadow-sm backdrop-blur-sm ${
          completed ? 'text-emerald-700' : 'text-teal-700'
        } ${className}`}
      >
        <Icon aria-hidden="true" className="h-3 w-3" />
        {pct}%
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
        completed
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-teal-50 text-teal-700 ring-1 ring-teal-200'
      } ${className}`}
    >
      <Icon aria-hidden="true" className="h-3 w-3" />
      {completed ? 'Đã hoàn thành' : `Đã học ${pct}%`}
    </span>
  );
}
