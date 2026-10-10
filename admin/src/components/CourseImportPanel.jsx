import { useState } from 'react';
import { Link } from 'react-router-dom';
import { courseCategories, mockCourses } from '../data/mockDashboardData.js';
import { resolveImageUrl } from '../utils/imageUrl.js';

const LESSON_TYPES = [
  { value: 'video', label: 'Video YouTube / Embed' },
  { value: 'audio', label: 'Audio Podcast' },
  { value: 'infographic', label: 'Infographic Tài Liệu' },
];

const blankForm = {
  title: '',
  category: courseCategories[0],
  duration: '',
  cover:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
  description: '',
  lessonTitle: '',
  lessonType: 'video',
  lessonUrl: '',
  lessonNotes: '',
  quizQuestion: '',
  quizA: '',
  quizB: '',
  quizC: '',
  quizD: '',
};

export default function CourseImportPanel() {
  const [courses, setCourses] = useState(mockCourses);
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = 'Tên khóa học không được trống.';
    if (!form.duration.trim()) next.duration = 'Vui lòng nhập thời lượng.';
    if (!form.cover.trim()) next.cover = 'Vui lòng dán URL ảnh bìa.';
    if (!form.lessonTitle.trim())
      next.lessonTitle = 'Vui lòng đặt tên bài học đầu tiên.';
    if (form.lessonType !== 'infographic' && !form.lessonUrl.trim()) {
      next.lessonUrl = 'Vui lòng dán URL nội dung bài học.';
    }
    if (
      form.quizQuestion.trim() &&
      (!form.quizA.trim() ||
        !form.quizB.trim() ||
        !form.quizC.trim() ||
        !form.quizD.trim())
    ) {
      next.quizA = 'Cần đủ A/B/C/D khi có câu hỏi trắc nghiệm.';
    }
    return next;
  }

  function buildFirstLesson() {
    if (!form.lessonTitle.trim()) return null;
    return {
      title: form.lessonTitle.trim(),
      type: form.lessonType,
      url: form.lessonUrl.trim(),
      notes: form.lessonNotes.trim(),
    };
  }

  function buildQuiz() {
    if (!form.quizQuestion.trim()) return null;
    return {
      question: form.quizQuestion.trim(),
      options: {
        A: form.quizA.trim(),
        B: form.quizB.trim(),
        C: form.quizC.trim(),
        D: form.quizD.trim(),
      },
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      showToast('Vui lòng kiểm tra các trường được đánh dấu.', 'error');
      return;
    }
    const newCourse = {
      id: `c${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      duration: form.duration.trim(),
      cover: form.cover.trim(),
      description: form.description.trim(),
      lessons: form.lessonTitle.trim() ? 1 : 0,
      rating: 0,
      firstLesson: buildFirstLesson(),
      quiz: buildQuiz(),
    };
    setCourses((prev) => [newCourse, ...prev]);
    setForm(blankForm);
    showToast('Đã đăng bài học mới lên Mini App.', 'success');
  }

  function handleDelete(course, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Xoá khóa học "${course.title}"?`)) return;
    setCourses((prev) => prev.filter((c) => c.id !== course.id));
    showToast('Đã xoá khóa học.', 'success');
  }

  return (
    <div className="space-y-3">
      {toast && (
        <div
          className={`rounded-xl border px-3.5 py-2 text-xs font-bold shadow-xs ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form column */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
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
              className="lucide lucide-plus w-5 h-5 text-[#E60067]"
              aria-hidden="true"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Nhập Bài Học / Khóa Học Mới
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs" noValidate>
            <div>
              <label className="text-slate-800 font-bold mb-1 block">
                Tên Khóa Học / Chủ Đề *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="VD: Quản lý chi tiêu & Tích lũy cho gia đình"
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-[#E60067] outline-none ${
                  errors.title ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-800 font-bold mb-1 block">
                  Danh Mục
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium outline-none"
                >
                  {courseCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-800 font-bold mb-1 block">
                  Thời Lượng *
                </label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => set('duration', e.target.value)}
                  placeholder="VD: 45 phút"
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-slate-900 font-medium outline-none ${
                    errors.duration ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
                {errors.duration && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.duration}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-slate-800 font-bold mb-1 block">
                Ảnh Bìa Khóa Học (URL) *
              </label>
              <input
                type="text"
                value={form.cover}
                onChange={(e) => set('cover', e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900 text-xs outline-none ${
                  errors.cover ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.cover && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.cover}</p>
              )}
            </div>

            <div>
              <label className="text-slate-800 font-bold mb-1 block">
                Mô Tả Ngắn Khóa Học
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Nội dung tóm tắt giá trị kiến thức khóa học mang lại..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
              />
            </div>

            <div className="bg-pink-50/60 p-3.5 rounded-xl border border-pink-200 space-y-2.5">
              <span className="font-extrabold text-[#E60067] text-xs block">
                Chi Tiết Bài Học Đầu Tiên
              </span>
              <div>
                <input
                  type="text"
                  value={form.lessonTitle}
                  onChange={(e) => set('lessonTitle', e.target.value)}
                  placeholder="Tên bài học (VD: Bài 1: Nhận diện link độc)"
                  className={`w-full bg-white border rounded-lg p-2.5 text-xs text-slate-900 outline-none ${
                    errors.lessonTitle ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
                {errors.lessonTitle && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.lessonTitle}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.lessonType}
                  onChange={(e) => set('lessonType', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  {LESSON_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={form.lessonUrl}
                  onChange={(e) => set('lessonUrl', e.target.value)}
                  placeholder={
                    form.lessonType === 'infographic'
                      ? 'URL ảnh tài liệu (tùy chọn)'
                      : 'URL Video/Audio embed...'
                  }
                  className={`w-full bg-white border rounded-lg p-2 text-xs text-slate-900 outline-none ${
                    errors.lessonUrl ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.lessonUrl && (
                <p className="text-[11px] text-rose-600">{errors.lessonUrl}</p>
              )}
              <textarea
                rows={2}
                value={form.lessonNotes}
                onChange={(e) => set('lessonNotes', e.target.value)}
                placeholder="Tóm tắt lời giảng hoặc ghi chú quan trọng..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200 space-y-2 text-xs">
              <span className="font-extrabold text-teal-800 text-xs block">
                Câu Hỏi Trắc Nghiệm Quiz (tùy chọn)
              </span>
              <input
                type="text"
                value={form.quizQuestion}
                onChange={(e) => set('quizQuestion', e.target.value)}
                placeholder="Nội dung câu hỏi kiểm tra kiến thức..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={form.quizA}
                  onChange={(e) => set('quizA', e.target.value)}
                  placeholder="Lựa chọn A"
                  className={`bg-white border rounded-lg p-2 outline-none ${
                    errors.quizA ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
                <input
                  type="text"
                  value={form.quizB}
                  onChange={(e) => set('quizB', e.target.value)}
                  placeholder="Lựa chọn B"
                  className="bg-white border border-slate-200 rounded-lg p-2 outline-none"
                />
                <input
                  type="text"
                  value={form.quizC}
                  onChange={(e) => set('quizC', e.target.value)}
                  placeholder="Lựa chọn C"
                  className="bg-white border border-slate-200 rounded-lg p-2 outline-none"
                />
                <input
                  type="text"
                  value={form.quizD}
                  onChange={(e) => set('quizD', e.target.value)}
                  placeholder="Lựa chọn D"
                  className="bg-white border border-slate-200 rounded-lg p-2 outline-none"
                />
              </div>
              {errors.quizA && (
                <p className="text-[11px] text-rose-600">{errors.quizA}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#E60067] hover:bg-[#c90059] text-white font-extrabold py-3 rounded-xl shadow-md text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
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
                className="lucide lucide-plus w-4 h-4"
                aria-hidden="true"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              <span>Đăng Bài Học Mới Lên Mini App</span>
            </button>
          </form>
        </div>

        {/* List column */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
            <span>Danh Sách Khóa Học Hiện Có ({courses.length})</span>
            <span className="text-xs font-normal text-slate-500">
              Đồng bộ trực tiếp Zalo Mini App
            </span>
          </h3>
          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                Chưa có khóa học nào. Hãy nhập khóa học đầu tiên từ form bên trái.
              </div>
            ) : (
              courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/admin/courses/${course.id}`}
                  state={{ course }}
                  className="block bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3.5 hover:border-[#E60067]/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                >
                  <img
                    alt={course.title}
                    className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0"
                    src={resolveImageUrl(course.cover)}
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-pink-50 text-[#E60067] font-bold text-[10px] px-2 py-0.5 rounded-md">
                        {course.category}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(course, e)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50"
                        title="Xóa khóa học"
                      >
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
                          className="lucide lucide-trash2 lucide-trash-2 w-4 h-4"
                          aria-hidden="true"
                        >
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M3 6h18"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1 group-hover:text-[#E60067]">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {course.description || (
                        <span className="italic text-slate-400">
                          (Chưa có mô tả)
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>⏱️ {course.duration}</span>
                      <span>📚 {course.lessons} bài học</span>
                      <span>⭐ {course.rating || '—'}</span>
                      <span className="ml-auto inline-flex items-center gap-0.5 text-[#E60067] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Xem chi tiết →
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
