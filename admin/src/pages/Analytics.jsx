import { useEffect, useState } from 'react';
import { fetchVisitStats } from '../services/visitApi.js';
import KPICard from '../components/KPICard.jsx';
import AnalyticsSkeleton from '../components/AnalyticsSkeleton.jsx';
import {
  VisitsAreaChart,
  RegistrationsLineChart,
  CourseViewsBarChart,
  TopCoursesBarChart,
  PageTypePieChart,
  TopPathsTable,
} from '../components/AnalyticsCharts.jsx';
import { useNotification } from '../store/notificationStore.js';

const GRANULARITY_OPTIONS = [
  { value: 'day', label: 'Theo ngày' },
  { value: 'month', label: 'Theo tháng' },
  { value: 'year', label: 'Theo năm' },
];

const KPIS = [
  {
    id: 'views',
    label: 'Tổng lượt truy cập',
    iconType: 'eye',
    iconColor: '[#E60067]',
  },
  {
    id: 'uniqueVisitors',
    label: 'Người dùng duy nhất',
    iconType: 'users',
    iconColor: 'teal-600',
  },
  {
    id: 'newUsers',
    label: 'Người đăng ký mới',
    iconType: 'user-plus',
    iconColor: 'sky-600',
  },
  {
    id: 'courseViews',
    label: 'Lượt xem khóa học',
    iconType: 'book',
    iconColor: 'amber-600',
  },
];

export default function Analytics() {
  const [granularity, setGranularity] = useState('day');
  const [data, setData] = useState(null);
  // Khởi tạo = true để lần render đầu tiên hiện skeleton ngay,
  // tránh nháy 1 frame nội dung rỗng trước khi effect chạy.
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVisitStats({ granularity })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (cancelled) return;
        notify({
          type: 'error',
          title: 'Tải thống kê thất bại',
          message: err?.response?.data?.error || 'Không tải được thống kê.',
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [granularity, notify]);

  const totals = data?.totals || {};
  // Lần tải đầu (chưa có dữ liệu) → hiện skeleton.
  // Lần đổi kỳ (đã có dữ liệu cũ) → giữ dữ liệu cũ và làm mờ để không nhảy layout.
  const showSkeleton = loading && !data;
  const showStale = loading && !!data;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-extrabold text-slate-900">
            Thống kê truy cập
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Theo dõi lượt truy cập, lượt người đăng ký và lượt xem khóa học theo
            ngày / tháng / năm.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {GRANULARITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGranularity(opt.value)}
              disabled={loading}
              aria-pressed={granularity === opt.value}
              className={[
                'rounded-md px-2.5 py-1 text-[11px] font-bold transition',
                granularity === opt.value
                  ? 'bg-primary-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                loading ? 'cursor-wait opacity-60' : '',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
          {showStale && (
            <span
              role="status"
              aria-label="Đang cập nhật dữ liệu"
              className="ml-1 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-pink-500"
            />
          )}
        </div>
      </div>

      {showSkeleton ? (
        <AnalyticsSkeleton />
      ) : (
        <div className={showStale ? 'pointer-events-none opacity-50 transition-opacity' : ''}>
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {KPIS.map((kpi) => (
              <KPICard
                key={kpi.id}
                label={kpi.label}
                value={Number(totals[kpi.id] || 0).toLocaleString('vi-VN')}
                iconType={kpi.iconType}
                iconColor={kpi.iconColor}
              />
            ))}
          </div>

          {/* Biểu đồ theo kỳ */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <VisitsAreaChart data={data?.visitsByPeriod || []} />
            <RegistrationsLineChart data={data?.usersByPeriod || []} />
            <CourseViewsBarChart data={data?.courseViewsByPeriod || []} />
            <PageTypePieChart data={data?.byPageType || []} />
          </div>

          {/* Top khóa học + bảng trang */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <TopCoursesBarChart data={data?.topCourses || []} />
            <TopPathsTable data={data?.byPath || []} />
          </div>

          {/* Bảng chi tiết theo kỳ */}
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-700">
                Chi tiết theo kỳ
              </h3>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-[10px] font-bold uppercase text-slate-600">
                      Kỳ
                    </th>
                    <th className="px-2 py-2 text-right text-[10px] font-bold uppercase text-slate-600">
                      Lượt truy cập
                    </th>
                    <th className="px-2 py-2 text-right text-[10px] font-bold uppercase text-slate-600">
                      Người dùng duy nhất
                    </th>
                    <th className="px-2 py-2 text-right text-[10px] font-bold uppercase text-slate-600">
                      Đăng ký mới
                    </th>
                    <th className="px-2 py-2 text-right text-[10px] font-bold uppercase text-slate-600">
                      Xem khóa học
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.visitsByPeriod || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-4 text-center text-[11px] text-slate-400">
                        Chưa có dữ liệu.
                      </td>
                    </tr>
                  ) : (
                    (data?.visitsByPeriod || []).map((row) => {
                      const users =
                        (data?.usersByPeriod || []).find(
                          (u) => u.period === row.period
                        )?.count || 0;
                      const courseViews =
                        (data?.courseViewsByPeriod || []).find(
                          (c) => c.period === row.period
                        )?.count || 0;
                      return (
                        <tr key={row.period} className="hover:bg-slate-50">
                          <td className="px-2 py-1.5 font-mono text-[10px] text-slate-700">
                            {row.period}
                          </td>
                          <td className="px-2 py-1.5 text-right text-[11px] font-bold text-slate-900">
                            {row.views}
                          </td>
                          <td className="px-2 py-1.5 text-right text-[11px] text-slate-600">
                            {row.uniqueVisitors}
                          </td>
                          <td className="px-2 py-1.5 text-right text-[11px] text-slate-600">
                            {users}
                          </td>
                          <td className="px-2 py-1.5 text-right text-[11px] text-slate-600">
                            {courseViews}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
