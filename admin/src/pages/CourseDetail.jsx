import { useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { mockCourses } from '../data/mockDashboardData.js';
import { extractYoutubeId } from '../utils/youtube.js';
import { resolveImageUrl } from '../utils/imageUrl.js';

const LESSON_TYPE_LABELS = {
  video: { label: 'Video YouTube / Embed', color: 'bg-rose-50 text-rose-600' },
  audio: { label: 'Audio Podcast', color: 'bg-violet-50 text-violet-600' },
  infographic: { label: 'Infographic Tài Liệu', color: 'bg-amber-50 text-amber-700' },
};

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const course = useMemo(() => {
    // Ưu tiên course truyền qua location state (khi click từ CourseImportPanel)
    const fromState = location.state?.course;
    if (fromState && String(fromState.id) === String(courseId)) {
      return fromState;
    }
    // Fallback: tra trong mock data
    return mockCourses.find((c) => String(c.id) === String(courseId)) || null;
  }, [courseId, location.state]);

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
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
              className="w-7 h-7 text-rose-500"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
          <h2 className="text-base font-extrabold text-slate-900">
            Không tìm thấy khóa học
          </h2>
          <p className="text-xs text-slate-500">
            Khóa học với mã <span className="font-mono font-bold text-slate-700">{courseId}</span> không tồn tại hoặc đã bị xoá.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#E60067] hover:bg-[#c90059] px-4 py-2 text-xs font-extrabold text-white shadow-md transition-all"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const lesson = course.firstLesson;
  const quiz = course.quiz;
  const typeMeta = lesson ? LESSON_TYPE_LABELS[lesson.type] : null;
  const youtubeId = lesson?.type === 'video' ? extractYoutubeId(lesson.url || '') : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#E60067]"
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
            className="w-3.5 h-3.5"
          >
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Quay lại danh sách
        </button>
        <span className="text-[10px] font-mono text-slate-400">Mã: {course.id}</span>
      </div>

      {/* Hero card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
          <div className="md:col-span-2 bg-slate-100">
            <img
              src={resolveImageUrl(course.cover)}
              alt={course.title}
              className="w-full h-48 md:h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="24" height="24" fill="%23f1f5f9"/><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
              }}
            />
          </div>
          <div className="md:col-span-3 p-5 md:p-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-pink-50 text-[#E60067] font-extrabold text-[10px] px-2.5 py-1 rounded-md border border-pink-200 uppercase tracking-wider">
                {course.category}
              </span>
              {lesson && typeMeta && (
                <span
                  className={`font-extrabold text-[10px] px-2.5 py-1 rounded-md border border-current/20 ${typeMeta.color}`}
                >
                  {typeMeta.label}
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              {course.description || (
                <span className="italic text-slate-400">(Chưa có mô tả cho khóa học này.)</span>
              )}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-500">⏱ Thời lượng</p>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {course.duration || '—'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-500">📚 Số bài học</p>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {course.lessons ?? 0} bài
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-500">⭐ Đánh giá</p>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {course.rating ? `${course.rating} / 5` : '—'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/courses/${course.id}/lessons`)
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E60067] hover:bg-[#c90059] px-4 py-2 text-xs font-extrabold text-white shadow-md transition-all"
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
                  className="w-3.5 h-3.5"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Quản lý danh sách bài học
              </button>
              <Link
                to="/admin/showcase"
                state={{ tab: 'lessons' }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-extrabold text-slate-700 transition-all"
              >
                🎓 Về trang Nhập Bài Học
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson + Quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bài học đầu tiên */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
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
              className="w-4 h-4 text-[#E60067]"
            >
              <path d="m22 8-6 4 6 4V8Z"></path>
              <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
            </svg>
            <h3 className="text-sm font-extrabold text-slate-900">Bài học đầu tiên</h3>
          </div>

          {!lesson ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Khóa học này chưa có bài học nào.
            </div>
          ) : (
            <div className="p-5 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500">Tên bài học</p>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {lesson.title || <span className="italic text-slate-400">(Chưa đặt tên)</span>}
                </p>
              </div>

              {/* Media preview */}
              {lesson.type === 'video' && youtubeId && (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              )}
              {lesson.type === 'video' && !youtubeId && lesson.url && (
                <div className="rounded-xl border border-dashed border-slate-200 p-3 text-[11px] text-slate-500 break-all">
                  Link video: <span className="font-mono">{lesson.url}</span>
                </div>
              )}
              {lesson.type === 'audio' && lesson.url && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <audio controls className="w-full" src={lesson.url}>
                    Trình duyệt không hỗ trợ phát audio.
                  </audio>
                </div>
              )}
              {lesson.type === 'infographic' && lesson.url && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={resolveImageUrl(lesson.url)}
                    alt={lesson.title}
                    className="w-full max-h-80 object-contain bg-white"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {lesson.notes && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">
                    Tóm tắt lời giảng / Ghi chú
                  </p>
                  <p className="text-xs text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
                    {lesson.notes}
                  </p>
                </div>
              )}

              {lesson.url && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-[10px] text-slate-500 break-all">
                  <span className="font-bold text-slate-600">URL nội dung: </span>
                  <span className="font-mono">{lesson.url}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quiz */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
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
              className="w-4 h-4 text-teal-600"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <path d="M12 17h.01"></path>
            </svg>
            <h3 className="text-sm font-extrabold text-slate-900">Câu hỏi trắc nghiệm</h3>
          </div>

          {!quiz || !quiz.question ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Khóa học này chưa có bài trắc nghiệm.
            </div>
          ) : (
            <div className="p-5 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500">Câu hỏi</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1 leading-relaxed">
                  {quiz.question}
                </p>
              </div>
              <ul className="space-y-1.5">
                {['A', 'B', 'C', 'D'].map((key) => {
                  const value = quiz.options?.[key];
                  if (!value) return null;
                  const isCorrect = quiz.correct === key;
                  return (
                    <li
                      key={key}
                      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-xs ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                          isCorrect
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-slate-500 border border-slate-200'
                        }`}
                      >
                        {key}
                      </span>
                      <span className="flex-1">{value}</span>
                      {isCorrect && (
                        <span className="text-[10px] font-extrabold text-emerald-600">
                          Đúng
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {!quiz.correct && (
                <p className="text-[10px] italic text-slate-400">
                  (Chưa đánh dấu đáp án đúng)
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
