import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import KPICard from '../components/KPICard.jsx';
import { IncomeGrowthChart, LessonDistributionChart } from '../components/DashboardCharts.jsx';
import CourseIntakeForm from '../components/CourseIntakeForm.jsx';
import { fetchAllCoursesAdmin } from '../services/courseApi.js';
import { fetchCourseContent } from '../services/courseIntakeApi.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import { useNotification } from '../store/notificationStore.js';
import {
  kpiMetrics,
  uxMetrics,
  incomeGrowthData,
  lessonDistributionData,
  dashboardTabs,
} from '../data/mockDashboardData.js';

export default function DashboardShowcase() {
  const initialTabs = dashboardTabs.map((t, i) => ({
    ...t,
    active: i === 0,
  }));
  const [tabs, setTabs] = useState(initialTabs);
  const activeTab = tabs.find((t) => t.active)?.id || 'overview';

  // ─── Dữ liệu khóa học thật cho tab "Nhập Bài Học" ───
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const { notify } = useNotification();

  function selectTab(id) {
    setTabs((prev) => prev.map((t) => ({ ...t, active: t.id === id })));
  }

  async function loadCourses() {
    setLoadingCourses(true);
    try {
      const items = await fetchAllCoursesAdmin();
      setCourses(items);
    } catch (err) {
      notify({
        type: 'error',
        title: 'Tải dữ liệu thất bại',
        message: err?.response?.data?.error || 'Không tải được khóa học.',
      });
    } finally {
      setLoadingCourses(false);
    }
  }

  useEffect(() => {
    if (activeTab !== 'lessons') return;
    loadCourses();
  }, [activeTab]);

  async function openLessonEditor(lessonId) {
    setEditingLessonId(lessonId);
  }

  async function loadCourseLessons(courseId) {
    try {
      const data = await fetchCourseContent(courseId);
      setCourseLessons(data.items || []);
    } catch {
      setCourseLessons([]);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans space-y-4">
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
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              tab.active
                ? 'bg-[#E60067] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.icon} {tab.label}</span>
            {tab.count && (
              <span className={`ml-0.5 ${tab.active ? 'text-white/90' : 'text-slate-500'}`}>
                ({tab.count})
              </span>
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

      {activeTab === 'overview' && (
        <>
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
        </>
      )}

      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Form column */}
          <div className="lg:col-span-5">
            <CourseIntakeForm
              lessonId={editingLessonId}
              onSaved={() => {
                setEditingLessonId(null);
                loadCourses();
              }}
            />
            {editingLessonId && (
              <button
                type="button"
                onClick={() => setEditingLessonId(null)}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
              >
                ← Huỷ chỉnh sửa, tạo bài học mới
              </button>
            )}
          </div>

          {/* List column */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="flex items-center justify-between text-sm font-extrabold text-slate-900">
              <span>Danh Sách Khóa Học Hiện Có ({courses.length})</span>
              <span className="text-xs font-normal text-slate-500">
                Đồng bộ trực tiếp Zalo Mini App
              </span>
            </h3>

            {loadingCourses ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                Đang tải...
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                Chưa có khóa học nào. Hãy nhập khóa học đầu tiên từ form bên trái.
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        alt={course.title}
                        className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 object-cover"
                        src={resolveImageUrl(course.coverUrl || course.thumbnail)}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="line-clamp-1 text-sm font-extrabold text-slate-900">
                            {course.title}
                          </h4>
                          <Link
                            to={`/admin/courses/${course._id}`}
                            className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                          >
                            Chi tiết
                          </Link>
                        </div>
                        <p className="line-clamp-2 text-xs text-slate-500">
                          {course.description || (
                            <span className="italic text-slate-400">(Chưa có mô tả)</span>
                          )}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                          <span>⏱️ {course.durationMinutes || 0} phút</span>
                          <span>📚 {course.lessonsCount || 0} bài học</span>
                          <span>⭐ {course.rating || '—'}</span>
                          {course.category && (
                            <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-[#E60067]">
                              {course.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Danh sách bài học + trạng thái 4 phần */}
                    <CourseLessonList
                      courseId={course._id}
                      lessons={courseLessons}
                      loadCourseLessons={loadCourseLessons}
                      onEdit={openLessonEditor}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!['overview', 'lessons'].includes(activeTab) && (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
          Tab <span className="font-bold text-slate-700">{activeTab}</span> đang được
          xây dựng. Vui lòng quay lại sau.
        </div>
      )}
    </div>
  );
}

/** Danh sách bài học của 1 khóa + badge trạng thái 4 phần. */
function CourseLessonList({
  courseId,
  lessons,
  loadCourseLessons,
  onEdit,
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    loadCourseLessons(courseId);
  }, [expanded, courseId, loadCourseLessons]);

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-[11px] font-bold text-[#E60067] hover:underline"
      >
        {expanded ? '− Ẩn danh sách bài học' : '+ Xem danh sách bài học & trạng thái 4 phần'}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5">
          {lessons.length === 0 && (
            <p className="text-[11px] text-slate-400">Chưa có bài học nào.</p>
          )}
          {lessons.map((l) => {
            const content = l.content || {};
            const parts = [
              { label: 'Slide', ok: (content.slides || []).length > 0 },
              { label: 'Mô phỏng', ok: (content.simulations || []).length > 0 },
              { label: 'Tóm tắt', ok: Boolean(content.summary) },
              { label: 'Quiz', ok: (content.quizzes || []).length > 0 },
            ];
            return (
              <div
                key={l._id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-800">
                  {l.title}
                </span>
                {parts.map((p) => (
                  <span
                    key={p.label}
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      p.ok
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {p.ok ? '✓' : '–'} {p.label}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => onEdit(l._id)}
                  className="rounded-lg border border-pink-200 bg-pink-50 px-2 py-1 text-[10px] font-bold text-[#E60067] hover:bg-pink-100"
                >
                  Sửa 4 phần
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
