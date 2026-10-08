import KPICard from '../components/KPICard.jsx';
import { IncomeGrowthChart, LessonDistributionChart } from '../components/DashboardCharts.jsx';
import {
  kpiMetrics,
  uxMetrics,
  incomeGrowthData,
  lessonDistributionData,
  dashboardTabs,
} from '../data/mockDashboardData.js';

export default function DashboardShowcase() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-3 md:p-8 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 px-3 py-1.5 rounded-xl bg-[#E60067] border border-pink-300 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            <img
              alt="Logo Doanh Nghiệp"
              className="h-full w-auto max-w-[160px] object-contain"
              referrerPolicy="no-referrer"
              src="https://drive.google.com/thumbnail?id=1asdIo2tmk_ouFc-psQb51vzMoAFOPNXP&sz=w1000"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-pink-50 text-[#E60067] font-extrabold text-[11px] px-3 py-0.5 rounded-full border border-pink-200 uppercase tracking-wider">
                Web Admin &amp; ESG Management
              </span>
              <span className="bg-teal-50 text-teal-700 font-extrabold text-[11px] px-3 py-0.5 rounded-full border border-teal-200">
                GRI 404 • ESRS S1 Compliant
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              Quản Trị Hệ Thống "Hộ Chiếu An Toàn"
            </h1>
            <p className="text-xs text-slate-500">
              Dự án Loom for Women • Hệ thống CMS Đào Tạo, Workshop, Voucher &amp; Đo Lường Chỉ Số SROI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
              <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
              <path d="M10 9H8"></path>
              <path d="M16 13H8"></path>
              <path d="M16 17H8"></path>
            </svg>
            <span>Xuất Báo Cáo ESG (PDF/Excel)</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {dashboardTabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              tab.active
                ? 'bg-[#E60067] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.icon} {tab.label}</span>
            {tab.count && (
              <span className="ml-0.5">({tab.count})</span>
            )}
            {tab.badge && !tab.pulse && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {tab.badge}
              </span>
            )}
            {tab.badge && tab.pulse && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((metric) => (
          <KPICard key={metric.id} {...metric} />
        ))}
      </div>

      {/* UX Metrics Section */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#E60067]">
            <path d="M12 6v6l4 2"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          <span>Chỉ số Kỹ thuật &amp; Trải nghiệm Nữ công nhân (UX / Task Success)</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {uxMetrics.map((metric, index) => (
            <div key={index} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] font-medium">{metric.label}</span>
              <p className={`text-xl font-black mt-1 ${
                metric.color === 'emerald' ? 'text-emerald-600' : 'text-teal-700'
              }`}>
                {metric.value}
              </p>
              <span className="text-[10px] text-slate-400">{metric.target}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeGrowthChart data={incomeGrowthData} />
        <LessonDistributionChart data={lessonDistributionData} />
      </div>
    </div>
  );
}
