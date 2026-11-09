import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchCourseAdmin } from '../services/courseApi.js';
import { fetchCourseContent } from '../services/courseIntakeApi.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import { extractYoutubeId } from '../utils/youtube.js';
import { ArrowLeftIcon, FileTextIcon, VideoIcon, EditIcon } from '../components/icons.jsx';
import { useNotification } from '../store/notificationStore.js';
import LessonFourPartModal from '../components/LessonFourPartModal.jsx';
import { toStatements } from '../components/lessonDraft.js';

/**
 * Chi tiết khóa học (admin): hiển thị 4 phần nội dung của từng bài học.
 */
export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLessonId, setEditingLessonId] = useState(null);

  async function loadContent() {
    const contentData = await fetchCourseContent(courseId);
    setLessons(contentData.items || []);
  }

  useEffect(() => {
    if (!courseId) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [courseData, contentData] = await Promise.all([
          fetchCourseAdmin(courseId),
          fetchCourseContent(courseId),
        ]);
        if (cancelled) return;
        setCourse(courseData);
        setLessons(contentData.items || []);
      } catch (err) {
        if (cancelled) return;
        notify({
          type: 'error',
          title: 'Tải dữ liệu thất bại',
          message: err?.response?.data?.error || 'Không tải được khóa học.',
        });
        navigate('/courses', { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, navigate, notify]);

  if (loading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        Đang tải...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900">
          Không tìm thấy khóa học
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Khóa học với mã{' '}
          <span className="font-mono font-bold text-slate-700">{courseId}</span> không tồn tại
          hoặc đã bị xoá.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#E60067] px-4 py-2 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#c90059]"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#E60067]"
        >
          <ArrowLeftIcon aria-hidden="true" className="w-3.5 h-3.5" />
          Quay lại danh sách
        </button>
        <span className="font-mono text-[10px] text-slate-400">Mã: {course._id}</span>
      </div>

      {/* Hero card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-5">
          <div className="bg-slate-100 md:col-span-2">
            <img
              src={resolveImageUrl(course.coverUrl || course.thumbnail)}
              alt={course.title}
              className="h-48 w-full object-cover md:h-full"
            />
          </div>
          <div className="space-y-3 p-5 md:col-span-3 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              {course.category && (
                <span className="rounded-md border border-pink-200 bg-pink-50 px-2.5 py-1 text-[10px] font-extrabold text-[#E60067]">
                  {course.category}
                </span>
              )}
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">
                {lessons.length} bài học
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">
              {course.title}
            </h1>
            <p className="text-xs leading-relaxed text-slate-600">
              {course.description || (
                <span className="italic text-slate-400">(Chưa có mô tả cho khóa học này.)</span>
              )}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <Stat label="⏱ Thời lượng" value={`${course.durationMinutes || 0} phút`} />
              <Stat label="📚 Số bài học" value={`${lessons.length} bài`} />
              <Stat label="⭐ Đánh giá" value={course.rating ? `${course.rating} / 5` : '—'} />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                to={`/courses/${course._id}/lessons`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E60067] px-4 py-2 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#c90059]"
              >
                <VideoIcon aria-hidden="true" className="h-3.5 w-3.5" />
                Quản lý danh sách bài học
              </Link>
              <Link
                to={`/courses/${course._id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 transition-all hover:bg-slate-50"
              >
                ✏️ Sửa khóa học (4 phần)
              </Link>
              <Link
                to="/showcase"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 transition-all hover:bg-slate-50"
              >
                🎓 Về trang Nhập Bài Học
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách bài học + 4 phần */}
      <div className="space-y-3">
        {lessons.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            Khóa học này chưa có bài học nào.
          </div>
        )}
        {lessons.map((lesson, index) => (
          <LessonContentCard
            key={lesson._id}
            lesson={lesson}
            index={index}
            onEdit={setEditingLessonId}
          />
        ))}
      </div>

      {/* Modal sửa nội dung 4 phần */}
      {editingLessonId && (
        <LessonFourPartModal
          courseId={courseId}
          lessonId={editingLessonId}
          onClose={() => setEditingLessonId(null)}
          onSaved={async () => {
            setEditingLessonId(null);
            try {
              await loadContent();
            } catch {
              // im lặng — đã hiển thị thông báo ở form
            }
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
      <p className="text-[10px] font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

const PART_STYLES = {
  slide: { label: '1. Cung cấp kiến thức', box: 'border-pink-200 bg-pink-50/60', chip: 'bg-pink-100 text-[#E60067]' },
  simulation: { label: '2. Mô phỏng tình huống', box: 'border-teal-200 bg-teal-50/60', chip: 'bg-teal-100 text-teal-800' },
  summary: { label: '3. Tóm tắt bài học', box: 'border-slate-200 bg-slate-50', chip: 'bg-slate-200 text-slate-700' },
  quiz: { label: '4. Đánh giá nội dung học', box: 'border-amber-200 bg-amber-50/60', chip: 'bg-amber-100 text-amber-900' },
};

function LessonContentCard({ lesson, index, onEdit }) {
  const content = lesson.content || {};
  const slides = content.slides || [];
  const simulations = content.simulations || [];
  const quizzes = content.quizzes || [];
  const summary = content.summary;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
            {index + 1}
          </span>
          <h3 className="truncate text-sm font-extrabold text-slate-900">
            {lesson.title}
          </h3>
          {lesson.knowledgeTitle && lesson.knowledgeTitle !== lesson.title && (
            <span className="hidden truncate text-[11px] text-slate-500 sm:inline">
              — {lesson.knowledgeTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(lesson._id)}
            className="inline-flex items-center gap-1 rounded-lg border border-pink-200 bg-pink-50 px-2 py-1 text-[10px] font-bold text-[#E60067] hover:bg-pink-100"
          >
            <EditIcon aria-hidden="true" className="h-3 w-3" />
            Sửa 4 phần
          </button>
          <Link
            to={`/courses/${lesson.courseId}/lessons`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
          >
            <FileTextIcon aria-hidden="true" className="h-3 w-3" />
            Danh sách bài học
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-2">
        {/* Phần 1 */}
        <Section box={PART_STYLES.slide.box} title={PART_STYLES.slide.label}>
          {lesson.knowledgeContent && (
            <p className="mb-2 text-[11px] leading-relaxed text-slate-600">
              {lesson.knowledgeContent}
            </p>
          )}
          {lesson.slidePdfUrl && (
            <a
              href={resolveImageUrl(lesson.slidePdfUrl)}
              target="_blank"
              rel="noreferrer"
              className="mb-2 inline-flex items-center gap-1 rounded-full border border-pink-200 bg-white px-2 py-0.5 text-[10px] font-bold text-[#E60067]"
            >
              <FileTextIcon aria-hidden="true" className="h-3 w-3" />
              {lesson.slidePdfTitle || lesson.slidePdfName || 'File PDF slide'}
            </a>
          )}
          {slides.length === 0 ? (
            <Empty text="Chưa có slide nào." />
          ) : (
            <ul className="space-y-1.5">
              {slides.map((s) => (
                <li
                  key={s._id || s.title}
                  className="rounded-lg border border-pink-200 bg-white px-2.5 py-2"
                >
                  <p className="text-[11px] font-extrabold text-slate-800">{s.title}</p>
                  {(s.bullets || []).length > 0 && (
                    <ul className="mt-1 list-disc pl-4 text-[10px] text-slate-600">
                      {s.bullets.map((b, bi) => (
                        <li key={bi}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {s.note && (
                    <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-800">
                      {s.noteLabel ? `${s.noteLabel}: ` : ''}
                      {s.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Phần 2 */}
        <Section box={PART_STYLES.simulation.box} title={PART_STYLES.simulation.label}>
          {simulations.length === 0 ? (
            <Empty text="Chưa có video mô phỏng." />
          ) : (
            simulations.map((sim) => {
              const ytId = sim.youtubeId || extractYoutubeId(sim.videoUrl || '');
              const statements = toStatements(sim);
              return (
                <div key={sim._id} className="space-y-1.5">
                  {ytId && (
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                        title={sim.description || 'Video mô phỏng'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                  )}
                  {sim.description && (
                    <p className="text-[11px] text-slate-600">{sim.description}</p>
                  )}
                  {statements.map((st, si) => (
                    <p
                      key={`st-${si}`}
                      className="rounded-lg border border-teal-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700"
                    >
                      <span className="font-bold">Đúng/Sai {si + 1}:</span>{' '}
                      {st.text}{' '}
                      <span className="font-bold text-teal-700">
                        ({st.isCorrect ? 'Đúng' : 'Sai'})
                      </span>
                    </p>
                  ))}
                </div>
              );
            })
          )}
        </Section>

        {/* Phần 3 */}
        <Section box={PART_STYLES.summary.box} title={PART_STYLES.summary.label}>
          {!summary ? (
            <Empty text="Chưa có phần tóm tắt." />
          ) : (
            <div className="space-y-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  PART_STYLES.summary.chip
                }`}
              >
                {summary.format === 'pdf_video'
                  ? 'PDF Infographic + Video'
                  : summary.format === 'pdf'
                    ? 'Chỉ PDF Infographic'
                    : 'Chỉ Video Tóm Tắt'}
              </span>
              {summary.imageUrl && (
                <img
                  src={resolveImageUrl(summary.imageUrl)}
                  alt={summary.title || 'Infographic'}
                  className="max-h-40 w-full rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              {summary.videoUrl && (
                <p className="break-all font-mono text-[10px] text-slate-500">
                  {summary.videoUrl}
                </p>
              )}
            </div>
          )}
        </Section>

        {/* Phần 4 */}
        <Section box={PART_STYLES.quiz.box} title={PART_STYLES.quiz.label}>
          {quizzes.length === 0 ? (
            <Empty text="Chưa có câu hỏi trắc nghiệm." />
          ) : (
            quizzes.map((q) => (
              <div key={q._id} className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-800">{q.question}</p>
                <ul className="space-y-1">
                  {['A', 'B', 'C', 'D'].map((key) => {
                    const value = q.options?.[key];
                    if (!value) return null;
                    const isCorrect = q.correct === key;
                    return (
                      <li
                        key={key}
                        className={`flex items-start gap-2 rounded-lg border px-2 py-1.5 text-[11px] ${
                          isCorrect
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <span
                          className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                            isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'border border-slate-200 bg-slate-50 text-slate-500'
                          }`}
                        >
                          {key}
                        </span>
                        <span className="flex-1">{value}</span>
                        {isCorrect && (
                          <span className="text-[9px] font-extrabold text-emerald-600">
                            Đúng
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ box, title, children }) {
  return (
    <div className={`rounded-xl border p-3 ${box}`}>
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-700">
        {title}
      </p>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-2.5 py-3 text-center text-[11px] text-slate-400">
      {text}
    </p>
  );
}
