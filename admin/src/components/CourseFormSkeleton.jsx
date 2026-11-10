/**
 * CourseFormSkeleton — khung chờ (loading placeholder) cho trang Sửa/Thêm khóa học.
 *
 * Bố cục và kích thước được giữ IDENTICAL với trang thật (CourseForm.jsx) để
 * không có hiệu ứng "giật" (layout shift) khi dữ liệu khóa học về tới.
 */

const PULSE = 'animate-pulse bg-slate-200';

/** 1 ô nhập 1 dòng (input / select). */
function FieldSkeleton({ label = true, height = 'h-8' }) {
  return (
    <div>
      {label && <span className={`mb-1 block h-2.5 w-24 rounded ${PULSE}`} />}
      <span className={`block w-full rounded-md ${height} ${PULSE}`} />
    </div>
  );
}

/** 1 ô nhập nhiều dòng (textarea). */
function TextareaSkeleton({ rows = 3 }) {
  return (
    <div>
      <span className={`mb-1 block h-2.5 w-16 rounded ${PULSE}`} />
      <span className={`block w-full rounded-md ${PULSE}`} style={{ height: `${rows * 16 + 12}px` }} />
    </div>
  );
}

/** Khung tiêu đề trang. */
function HeaderSkeleton() {
  return (
    <div>
      <span className={`block h-4 w-32 rounded ${PULSE}`} />
      <span className={`mt-1.5 block h-3 w-80 rounded ${PULSE}`} />
    </div>
  );
}

/** Khung bảng danh sách bài học. */
function LessonTableSkeleton({ rows = 4 }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div className="flex gap-2 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <span className={`h-2.5 w-6 rounded ${PULSE}`} />
        <span className={`h-2.5 w-40 rounded ${PULSE}`} />
        <span className={`h-2.5 w-28 rounded ${PULSE}`} />
        <span className={`ml-auto h-2.5 w-10 rounded ${PULSE}`} />
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-2 border-b border-slate-50 px-2 py-2 last:border-b-0"
        >
          <span className={`h-2.5 w-6 rounded ${PULSE}`} />
          <span
            className={`h-2.5 rounded ${PULSE}`}
            style={{ width: `${50 - r * 6}%`, opacity: 1 - r * 0.14 }}
          />
          <span className="ml-auto flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={`h-4 w-12 rounded-full ${PULSE}`}
                style={{ opacity: 0.8 - i * 0.12 }}
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Toàn bộ khung chờ của trang Sửa/Thêm khóa học.
 * Dùng `role="status"` + `aria-busy` để screen reader thông báo trạng thái tải.
 */
export default function CourseFormSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Đang tải khóa học" className="space-y-3">
      {/* Nút quay lại */}
      <span className={`block h-3 w-40 rounded ${PULSE}`} />

      <HeaderSkeleton />

      <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
        {/* ─── Thông tin khóa học ─── */}
        <div className="space-y-3 border-b border-slate-100 pb-3">
          <span className={`block h-2.5 w-32 rounded ${PULSE}`} />
          <FieldSkeleton />
          <TextareaSkeleton />
          <div className="grid gap-3 sm:grid-cols-3">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className={`mb-1 block h-2.5 w-24 rounded ${PULSE}`} />
              <span className={`block h-8 w-full rounded-md border border-slate-200 ${PULSE}`} />
              <span className={`mt-1.5 block h-16 w-16 rounded ${PULSE}`} />
            </div>
            <FieldSkeleton />
          </div>
          <FieldSkeleton />
          <FieldSkeleton />
        </div>

        {/* ─── Danh sách bài học ─── */}
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1.5">
              <span className={`block h-2.5 w-24 rounded ${PULSE}`} />
              <span className={`block h-2.5 w-72 rounded ${PULSE}`} />
            </div>
            <span className={`h-7 w-28 shrink-0 rounded-md ${PULSE}`} />
          </div>
          <LessonTableSkeleton />
        </div>

        {/* ─── Xem trước thẻ hero ─── */}
        <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
          <span className={`mb-1.5 block h-2.5 w-28 rounded ${PULSE}`} />
          <span className={`block h-32 w-full rounded-lg ${PULSE}`} />
          <span className={`mt-1 block h-2.5 w-44 rounded ${PULSE}`} />
        </div>

        {/* ─── Cờ hiển thị ─── */}
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`h-3 w-20 rounded ${PULSE}`} />
          ))}
        </div>

        {/* ─── Nút lưu ─── */}
        <div className="flex gap-2 border-t border-slate-100 pt-3">
          <span className={`h-8 flex-1 rounded-md ${PULSE}`} />
          <span className={`h-8 flex-1 rounded-md ${PULSE}`} />
        </div>
      </div>
    </div>
  );
}
