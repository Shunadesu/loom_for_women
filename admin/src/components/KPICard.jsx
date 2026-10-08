export default function KPICard({ label, value, subtitle, badge, badgeColor, iconColor, iconType }) {
  const badgeClasses = {
    emerald: 'text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full',
    pink: 'text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full',
    teal: 'text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full',
    slate: 'text-slate-500 font-medium',
  };

  const valueClasses = {
    emerald: 'text-slate-900',
    orange: 'text-orange-600',
    pink: 'text-[#E60067]',
    teal: 'text-teal-700',
  };

  const getValueColor = () => {
    if (iconColor?.includes('orange')) return 'orange';
    if (iconColor?.includes('E60067')) return 'pink';
    if (iconColor?.includes('teal')) return 'teal';
    return 'emerald';
  };

  const icons = {
    'award': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 text-${iconColor}`}>
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
        <circle cx="12" cy="8" r="6"></circle>
      </svg>
    ),
    'trending-up': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 text-${iconColor}`}>
        <path d="M16 7h6v6"></path>
        <path d="m22 7-8.5 8.5-5-5L2 17"></path>
      </svg>
    ),
    'sparkles': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 text-${iconColor}`}>
        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
        <path d="M20 2v4"></path>
        <path d="M22 4h-4"></path>
        <circle cx="4" cy="20" r="2"></circle>
      </svg>
    ),
    'shield-check': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 text-${iconColor}`}>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
        <path d="m9 12 2 2 4-4"></path>
      </svg>
    ),
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
      <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
        <span className="font-semibold">{label}</span>
        {icons[iconType]}
      </div>
      <p className={`text-3xl font-black ${valueClasses[getValueColor()]}`}>
        {value}
      </p>
      {badge && (
        <span className={`text-[10px] inline-block mt-1 ${badgeClasses[badgeColor]}`}>
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
