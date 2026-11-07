import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  fontSize: '11px',
};

const AXIS_PROPS = {
  stroke: '#64748b',
  style: { fontSize: '11px' },
};

const Card = ({ title, icon, children, className = '' }) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-3 shadow-xs ${className}`}>
    <h3 className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-slate-800">
      <span aria-hidden="true">{icon}</span>
      <span>{title}</span>
    </h3>
    {children}
  </div>
);

/** 1. Lượt truy cập + người dùng duy nhất theo kỳ. */
export function VisitsAreaChart({ data = [] }) {
  return (
    <Card title="Lượt truy cập theo kỳ" icon="👁️">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E60067" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#E60067" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="period" {...AXIS_PROPS} />
            <YAxis allowDecimals={false} {...AXIS_PROPS} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Area
              type="monotone"
              dataKey="views"
              name="Lượt truy cập"
              stroke="#E60067"
              strokeWidth={2.5}
              fill="url(#colorViews)"
            />
            <Area
              type="monotone"
              dataKey="uniqueVisitors"
              name="Người dùng duy nhất"
              stroke="#0D9488"
              strokeWidth={2}
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/** 2. Người đăng ký mới theo kỳ. */
export function RegistrationsLineChart({ data = [] }) {
  return (
    <Card title="Người đăng ký mới theo kỳ" icon="👥">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="period" {...AXIS_PROPS} />
            <YAxis allowDecimals={false} {...AXIS_PROPS} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="count"
              name="Đăng ký mới"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/** 3. Lượt xem khóa học theo kỳ. */
export function CourseViewsBarChart({ data = [] }) {
  return (
    <Card title="Lượt xem khóa học theo kỳ" icon="📚">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="period" {...AXIS_PROPS} />
            <YAxis allowDecimals={false} {...AXIS_PROPS} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="count" name="Lượt xem khóa học" fill="#0D9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/** 4. Top khóa học được xem nhiều nhất (bar ngang). */
export function TopCoursesBarChart({ data = [] }) {
  return (
    <Card title="Top 10 khóa học được xem nhiều nhất" icon="🔥">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" allowDecimals={false} {...AXIS_PROPS} />
            <YAxis
              type="category"
              dataKey="title"
              width={130}
              {...AXIS_PROPS}
              tickFormatter={(v) => (v?.length > 22 ? `${v.slice(0, 22)}…` : v)}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="views" name="Lượt xem" fill="#E60067" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const PAGE_TYPE_COLORS = {
  home: '#E60067',
  course_list: '#0D9488',
  course_detail: '#3B82F6',
  product: '#F59E0B',
  other: '#94A3B8',
};

const PAGE_TYPE_LABELS = {
  home: 'Trang chủ',
  course_list: 'Danh sách khóa học',
  course_detail: 'Chi tiết khóa học',
  product: 'Cửa hàng',
  other: 'Trang khác',
};

/** 5. Phân bổ lượt xem theo nhóm trang. */
export function PageTypePieChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: PAGE_TYPE_LABELS[d.pageType] || d.pageType,
    value: d.views,
    color: PAGE_TYPE_COLORS[d.pageType] || '#94A3B8',
  }));

  return (
    <Card title="Phân bổ lượt xem theo nhóm trang" icon="🧭">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={85}
              dataKey="value"
              nameKey="name"
              stroke="#fff"
              strokeWidth={2}
              label={({ name, percent }) =>
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
              labelLine
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/** Danh sách trang được xem nhiều nhất. */
export function TopPathsTable({ data = [] }) {
  return (
    <Card title="Trang được xem nhiều nhất" icon="📄">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase text-slate-600">
                Đường dẫn
              </th>
              <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase text-slate-600">
                Nhóm
              </th>
              <th className="px-2 py-1.5 text-right text-[10px] font-bold uppercase text-slate-600">
                Lượt xem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-2 py-4 text-center text-[11px] text-slate-400">
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={`${row.path}-${row.pageType}`} className="hover:bg-slate-50">
                  <td className="px-2 py-1.5 font-mono text-[10px] text-slate-700">
                    {row.path}
                  </td>
                  <td className="px-2 py-1.5 text-[10px] text-slate-500">
                    {PAGE_TYPE_LABELS[row.pageType] || row.pageType}
                  </td>
                  <td className="px-2 py-1.5 text-right text-[11px] font-bold text-slate-900">
                    {row.views}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
