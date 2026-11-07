/**
 * AnalyticsSkeleton — khung chờ (loading placeholder) cho trang Thống kê.
 *
 * Bố cục và kích thước được giữ IDENTICAL với trang thật (Analytics.jsx +
 * AnalyticsCharts.jsx) để không có hiệu ứng "giật" (layout shift) khi dữ liệu
 * về tới.
 */

const PULSE = 'animate-pulse bg-slate-200';

/** Chiều cao giả lập cho các cột biểu đồ — cố định để render ổn định. */
const BAR_HEIGHTS = [
  42, 68, 55, 80, 47, 92, 61, 38, 74, 50, 85, 44, 63, 30, 58, 77, 49, 88, 66, 36,
  70, 52, 82, 45,
];

/** 1 thẻ KPI — cùng cấu trúc với KPICard. */
export function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
      <div className="mb-1 flex items-center justify-between">
        <span className={`h-3 w-28 rounded ${PULSE}`} />
        <span className={`h-4 w-4 rounded ${PULSE}`} />
      </div>
      <span className={`block h-6 w-16 rounded ${PULSE}`} />
    </div>
  );
}

/** 1 khung biểu đồ — tiêu đề + vùng vẽ giả lập. */
export function ChartSkeleton({ height = 'h-52', bars = 24 }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-3.5 w-3.5 rounded ${PULSE}`} />
        <span className={`h-3 w-40 rounded ${PULSE}`} />
      </div>
      <div className={`flex w-full items-end gap-1 ${height}`}>
        {Array.from({ length: bars }).map((_, i) => (
          <span
            key={i}
            className={`flex-1 rounded-t ${PULSE}`}
            style={{ height: `${BAR_HEIGHTS[i % BAR_HEIGHTS.length]}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Khung biểu đồ tròn (pie). */
export function PieSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-3.5 w-3.5 rounded ${PULSE}`} />
        <span className={`h-3 w-40 rounded ${PULSE}`} />
      </div>
      <div className="flex h-64 w-full items-center justify-center">
        <span className={`h-40 w-40 rounded-full ${PULSE}`} />
      </div>
    </div>
  );
}

/** Khung bảng (dùng cho "Trang được xem nhiều nhất"). */
export function TableSkeleton({ rows = 6, cols = 3 }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-3.5 w-3.5 rounded ${PULSE}`} />
        <span className={`h-3 w-40 rounded ${PULSE}`} />
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <div className="flex gap-2 border-b border-slate-100 bg-slate-50 px-2 py-1.5">
          {Array.from({ length: cols }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 rounded ${PULSE}`}
              style={{ width: i === 0 ? '45%' : '20%' }}
            />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-2 border-b border-slate-50 px-2 py-2 last:border-b-0"
          >
            {Array.from({ length: cols }).map((_, c) => (
              <span
                key={c}
                className={`h-2.5 rounded ${PULSE}`}
                style={{
                  width: c === 0 ? '45%' : '20%',
                  opacity: 1 - r * 0.12,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Khung bảng "Chi tiết theo kỳ". */
export function PeriodTableSkeleton({ rows = 8 }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
        <span className={`block h-3 w-32 rounded ${PULSE}`} />
      </div>
      <div className="max-h-[420px] overflow-hidden px-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-2 border-b border-slate-50 py-2 last:border-b-0"
          >
            <span
              className={`h-2.5 w-20 rounded font-mono ${PULSE}`}
              style={{ opacity: 1 - r * 0.1 }}
            />
            <span className="ml-auto flex gap-6">
              <span className={`h-2.5 w-8 rounded ${PULSE}`} />
              <span className={`h-2.5 w-8 rounded ${PULSE}`} />
              <span className={`h-2.5 w-8 rounded ${PULSE}`} />
              <span className={`h-2.5 w-8 rounded ${PULSE}`} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Toàn bộ khung chờ của trang Thống kê.
 * Dùng `role="status"` + `aria-busy` để screen reader thông báo trạng thái tải.
 */
export default function AnalyticsSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Đang tải dữ liệu thống kê">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>

      {/* Biểu đồ theo kỳ */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <PieSkeleton />
      </div>

      {/* Top khóa học + bảng trang */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ChartSkeleton height="h-64" bars={10} />
        <TableSkeleton />
      </div>

      {/* Bảng chi tiết theo kỳ */}
      <div className="mt-3">
        <PeriodTableSkeleton />
      </div>
    </div>
  );
}
