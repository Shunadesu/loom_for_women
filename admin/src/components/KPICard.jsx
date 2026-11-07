/**
 * KPICard — thẻ KPI dùng chung cho admin.
 *
 * LƯU Ý: Tailwind chỉ quét được class viết tĩnh trong source, nên các class
 * màu KHÔNG được ghép động (`text-${iconColor}`) — phải khai báo tường minh
 * trong COLOR_CLASSES để chúng có mặt trong CSS khi build.
 */
const COLOR_CLASSES = {
  'emerald-600': 'text-emerald-600',
  'orange-500': 'text-orange-500',
  'orange-600': 'text-orange-600',
  '[#E60067]': 'text-[#E60067]',
  'teal-600': 'text-teal-600',
  'sky-600': 'text-sky-600',
  'amber-600': 'text-amber-600',
};

const VALUE_CLASSES = {
  emerald: 'text-slate-900',
  orange: 'text-orange-600',
  pink: 'text-[#E60067]',
  teal: 'text-teal-700',
  sky: 'text-sky-700',
  amber: 'text-amber-600',
};

const BADGE_CLASSES = {
  emerald: 'text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full',
  pink: 'text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full',
  teal: 'text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full',
  slate: 'text-slate-500 font-medium',
};

/** Suy ra màu giá trị từ màu icon. */
const getValueColor = (iconColor = '') => {
  if (iconColor.includes('orange')) return 'orange';
  if (iconColor.includes('E60067')) return 'pink';
  if (iconColor.includes('teal')) return 'teal';
  if (iconColor.includes('sky')) return 'sky';
  if (iconColor.includes('amber')) return 'amber';
  return 'emerald';
};

const ICONS = {
  award: (
    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
  ),
  'trending-up': (
    <path d="M16 7h6v6"></path>
  ),
  sparkles: (
    <path d="M11.017 2.814a.5.5 0 0 1 .958 0l.597 2.457a1 1 0 0 0 .841.841l2.457.597a.5.5 0 0 1 0 .958l-2.457.597a1 1 0 0 0-.841.841l-.597 2.457a.5.5 0 0 1-.958 0l-.597-2.457a1 1 0 0 0-.841-.841l-2.457-.597a.5.5 0 0 1 0-.958l2.457-.597a1 1 0 0 0 .841-.841z"></path>
  ),
  'shield-check': (
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a.5.5 0 0 1-.66 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1 1 1 0 0 0 1-1V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1 1 1 0 0 0 1-1V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7c0 5-3.5 7.5-7.66 8.95a.5.5 0 0 1-.66 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1z"></path>
  ),
  eye: (
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
  ),
  users: (
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
  ),
  'user-plus': (
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
  ),
  book: (
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
  ),
};

/** Các phần tử SVG bổ sung cho từng icon (vòng tròn / đường thẳng). */
const ICON_EXTRAS = {
  award: [<circle cx="12" cy="8" r="6" key="c" />],
  'trending-up': [
    <path d="m22 7-8.5 8.5-5-5L2 17" key="p" />,
  ],
  sparkles: [
    <path d="M20 2v4" key="a" />,
    <path d="M22 4h-4" key="b" />,
    <circle cx="4" cy="20" r="2" key="c" />,
  ],
  'shield-check': [<path d="m9 12 2 2 4-4" key="p" />],
  eye: [<circle cx="12" cy="12" r="3" key="c" />],
  users: [
    <circle cx="9" cy="7" r="4" key="c" />,
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" key="p1" />,
    <path d="M16 3.13a4 4 0 0 1 0 7.75" key="p2" />,
  ],
  'user-plus': [
    <circle cx="9" cy="7" r="4" key="c" />,
    <line x1="19" x2="19" y1="8" y2="14" key="l1" />,
    <line x1="22" x2="16" y1="11" y2="11" key="l2" />,
  ],
  book: [
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" key="p" />,
  ],
};

export default function KPICard({ label, value, subtitle, badge, badgeColor, iconColor, iconType }) {
  const iconClass = COLOR_CLASSES[iconColor] || 'text-slate-400';
  const valueClass = VALUE_CLASSES[getValueColor(iconColor)];

  return (
    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs hover:shadow-sm transition-all">
      <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
        <span className="font-semibold">{label}</span>
        {ICONS[iconType] && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 ${iconClass}`}
          >
            {ICONS[iconType]}
            {(ICON_EXTRAS[iconType] || []).map((el) => el)}
          </svg>
        )}
      </div>
      <p className={`text-xl font-black ${valueClass}`}>{value}</p>
      {badge && (
        <span className={`text-[10px] inline-block mt-1 ${BADGE_CLASSES[badgeColor]}`}>
          {badge}
        </span>
      )}
      {subtitle && (
        <span className="text-[10px] text-slate-500 font-medium inline-block mt-1">
          {subtitle}
        </span>
      )}
    </div>
  );
}
