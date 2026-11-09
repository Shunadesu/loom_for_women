import { useEffect, useMemo, useState } from 'react';
import SlideEditorList from './SlideEditorList.jsx';
import QuizEditor from './QuizEditor.jsx';
import SummaryFormatPicker from './SummaryFormatPicker.jsx';
import {
  createCourseWithLesson,
  updateLessonContent,
  fetchLessonContent,
} from '../services/courseIntakeApi.js';
import { useNotification } from '../store/notificationStore.js';
import { resolveImageUrl } from '../utils/imageUrl.js';

const CATEGORY_OPTIONS = [
  'Phòng chống lừa đảo',
  'Quản lý tài chính',
  'Kỹ năng thủ công',
  'Quyền lợi lao động',
];

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';

const emptyForm = () => ({
  title: '',
  category: CATEGORY_OPTIONS[0],
  durationMinutes: 0,
  coverUrl: DEFAULT_COVER,
  description: '',
  // Phần 1
  lessonTitle: '',
  knowledgeTitle: '',
  knowledgeContent: '',
  slidePdfTitle: '',
  slides: [],
  // Phần 2
  simulation: { videoUrl: '', description: '', statement: '', isCorrect: false },
  // Phần 3
  summary: { format: 'pdf_video', imageUrl: '', videoUrl: '', title: '' },
  // Phần 4
  quiz: {
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    correct: 'B',
    videoUrl: '',
    videoDescription: '',
    explain: '',
    type: 'single',
  },
});

/**
 * Form "Nhập Bài Học / Khóa Học Mới" — 4 phần nội dung.
 *
 * Props:
 * - lessonId : nếu có → chế độ sửa bài học đã tồn tại
 * - onSaved  : callback sau khi lưu thành công
 */
export default function CourseIntakeForm({ lessonId, onSaved }) {
  const [form, setForm] = useState(emptyForm());
  const [slidePdfFile, setSlidePdfFile] = useState(null);
  const [slidePdfName, setSlidePdfName] = useState('');
  const [summaryImageFile, setSummaryImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(lessonId));
  const { notify } = useNotification();

  const isEdit = Boolean(lessonId);

  // Nạp dữ liệu khi sửa bài học có sẵn
  useEffect(() => {
    if (!lessonId) {
      setForm(emptyForm());
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchLessonContent(lessonId);
        if (cancelled) return;
        const { lesson, content } = data;
        const slides = (content.slides || []).map((s) => ({
          title: s.title || '',
          content: s.content || '',
          bullets: s.bullets || [],
          imageUrl: s.imageUrl || '',
          note: s.note || '',
          noteLabel: s.noteLabel || '',
        }));
        const quiz = content.quizzes?.[0];
        const sim = content.simulations?.[0];
        setForm({
          title: '',
          category: '',
          durationMinutes: 0,
          coverUrl: '',
          description: '',
          lessonTitle: lesson.title || '',
          knowledgeTitle: lesson.knowledgeTitle || '',
          knowledgeContent: lesson.knowledgeContent || '',
          slidePdfTitle: lesson.slidePdfTitle || '',
          slides,
          simulation: sim
            ? {
                videoUrl: sim.videoUrl || '',
                description: sim.description || '',
                statement: sim.statement || '',
                isCorrect: sim.isCorrect !== false,
              }
            : { videoUrl: '', description: '', statement: '', isCorrect: false },
          summary: content.summary
            ? {
                format: content.summary.format || 'pdf_video',
                imageUrl: content.summary.imageUrl || '',
                videoUrl: content.summary.videoUrl || '',
                title: content.summary.title || '',
              }
            : { format: 'pdf_video', imageUrl: '', videoUrl: '', title: '' },
          quiz: quiz
            ? {
                question: quiz.question || '',
                options: quiz.options || { A: '', B: '', C: '', D: '' },
                correct: quiz.correct || 'B',
                videoUrl: quiz.videoUrl || '',
                videoDescription: quiz.videoDescription || '',
                explain: quiz.explain || '',
                type: quiz.type || 'single',
              }
            : {
                question: '',
                options: { A: '', B: '', C: '', D: '' },
                correct: 'B',
                videoUrl: '',
                videoDescription: '',
                explain: '',
                type: 'single',
              },
        });
        setSlidePdfName(lesson.slidePdfName || '');
      } catch (err) {
        notify({
          type: 'error',
          title: 'Tải dữ liệu thất bại',
          message: err?.response?.data?.error || 'Không tải được nội dung bài học.',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId, notify]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  };

  const setNested = (key, patch) => {
    setForm((f) => ({ ...f, [key]: { ...f[key], ...patch } }));
  };

  const validate = () => {
    const next = {};
    if (!isEdit && !form.title.trim()) {
      next.title = 'Tên khóa học không được trống.';
    }
    if (!form.lessonTitle.trim()) {
      next.lessonTitle = 'Vui lòng đặt tên bài học.';
    }
    if (!isEdit && !form.coverUrl.trim()) {
      next.coverUrl = 'Vui lòng dán URL ảnh bìa.';
    }
    if (form.quiz.question.trim()) {
      const opts = form.quiz.options || {};
      const required =
        form.quiz.type === 'true_false' ? ['A', 'B'] : ['A', 'B', 'C', 'D'];
      const missing = required.some((k) => !String(opts[k] || '').trim());
      if (missing) {
        next.quiz = 'Cần đủ lựa chọn khi đã nhập câu hỏi trắc nghiệm.';
      }
    }
    return next;
  };

  const buildFormData = () => {
    const fd = new FormData();
    if (!isEdit) {
      fd.append('title', form.title.trim());
      fd.append('category', form.category);
      fd.append('coverUrl', form.coverUrl.trim());
      fd.append('description', form.description.trim());
      fd.append('durationMinutes', String(form.durationMinutes || 0));
    }
    fd.append('lessonTitle', form.lessonTitle.trim());
    fd.append('knowledgeTitle', form.knowledgeTitle.trim());
    fd.append('knowledgeContent', form.knowledgeContent.trim());
    fd.append('slidePdfTitle', form.slidePdfTitle.trim());
    fd.append('slides', JSON.stringify(form.slides || []));
    fd.append(
      'simulations',
      JSON.stringify(
        form.simulation.videoUrl.trim() || form.simulation.description.trim()
          ? [form.simulation]
          : []
      )
    );
    fd.append('summary', JSON.stringify(form.summary || {}));
    fd.append(
      'quizzes',
      JSON.stringify(form.quiz.question.trim() ? [form.quiz] : [])
    );
    if (slidePdfFile) fd.append('slidePdf', slidePdfFile);
    if (summaryImageFile) fd.append('summaryImage', summaryImageFile);
    return fd;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      notify({
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng kiểm tra các trường được đánh dấu.',
      });
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateLessonContent(lessonId, buildFormData());
        notify({
          type: 'success',
          title: 'Cập nhật thành công',
          message: 'Bài học đã được cập nhật.',
        });
      } else {
        await createCourseWithLesson(buildFormData());
        notify({
          type: 'success',
          title: 'Đăng bài học thành công',
          message: 'Bài học mới đã được đăng lên Mini App.',
        });
        setForm(emptyForm());
        setSlidePdfFile(null);
        setSlidePdfName('');
        setSummaryImageFile(null);
      }
      if (onSaved) onSaved();
    } catch (err) {
      notify({
        type: 'error',
        title: 'Lưu thất bại',
        message: err?.response?.data?.error || 'Lưu bài học thất bại.',
      });
    } finally {
      setSaving(false);
    }
  }

  const slideCount = useMemo(() => form.slides?.length || 0, [form.slides]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        Đang tải nội dung bài học...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3.5 rounded-2xl border border-slate-200 bg-white p-5 text-xs shadow-xs"
      noValidate
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E60067] text-white">
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
              className="h-3 w-3"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </span>
          <h3 className="text-sm font-extrabold text-slate-900">
            {isEdit ? 'Chỉnh Sửa Bài Học 4 Phần' : 'Nhập Bài Học / Khóa Học Mới'}
          </h3>
        </div>
        {isEdit && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
            Đang sửa bài học đã có
          </span>
        )}
      </div>

      {/* ─── Thông tin khóa học ─── */}
      {!isEdit && (
        <>
          <div>
            <label className="mb-1 block font-bold text-slate-800">
              Tên Khóa Học / Chủ Đề *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="VD: Quản lý chi tiêu & Tích lũy cho gia đình"
              className={`w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 font-medium text-slate-900 outline-none focus:bg-white focus:border-[#E60067] ${
                errors.title ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-bold text-slate-800">Danh Mục</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-[#E60067]"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-800">
                Thời Lượng (phút)
              </label>
              <input
                type="number"
                min="0"
                value={form.durationMinutes}
                onChange={(e) => set('durationMinutes', Number(e.target.value) || 0)}
                placeholder="VD: 45"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-[#E60067]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-800">
              Ảnh Bìa Khóa Học (URL) *
            </label>
            <input
              type="text"
              value={form.coverUrl}
              onChange={(e) => set('coverUrl', e.target.value)}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:bg-white focus:border-[#E60067] ${
                errors.coverUrl ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.coverUrl && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.coverUrl}</p>
            )}
            {form.coverUrl && (
              <img
                src={resolveImageUrl(form.coverUrl)}
                alt="Ảnh bìa"
                className="mt-2 h-24 w-full rounded-xl object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-800">
              Mô Tả Ngắn Khóa Học
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Nội dung tóm tắt giá trị kiến thức khóa học mang lại..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none focus:bg-white focus:border-[#E60067]"
            />
          </div>
        </>
      )}

      {/* ─── Phần 1 ─── */}
      <div className="space-y-2.5 rounded-xl border border-pink-200 bg-pink-50/70 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-extrabold text-[#E60067]">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E60067] text-[10px] text-white">
              1
            </span>
            <span>Phần 1: Cung Cấp Kiến Thức (Slide &amp; Nội Dung)</span>
          </div>
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-800">
            Tên bài học *
          </label>
          <input
            type="text"
            value={form.lessonTitle}
            onChange={(e) => set('lessonTitle', e.target.value)}
            placeholder="VD: Bài 1: Nhận diện bẫy việc nhẹ lương cao"
            className={`w-full rounded-lg border bg-white p-2.5 text-slate-900 outline-none focus:border-[#E60067] ${
              errors.lessonTitle ? 'border-rose-300' : 'border-slate-200'
            }`}
          />
          {errors.lessonTitle && (
            <p className="mt-1 text-[11px] text-rose-600">{errors.lessonTitle}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-800">
            Tiêu đề bài học hiển thị ở phần 1
          </label>
          <input
            type="text"
            value={form.knowledgeTitle}
            onChange={(e) => set('knowledgeTitle', e.target.value)}
            placeholder="VD: Bài 1: Cầm kim móc & tạo mũi móc xích cơ bản"
            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-[#E60067]"
          />
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-800">
            Nội dung bài học dạng Slide &amp; Text chi tiết
          </label>
          <textarea
            rows={3}
            value={form.knowledgeContent}
            onChange={(e) => set('knowledgeContent', e.target.value)}
            placeholder="Nội dung bài học dạng Slide & Text chi tiết (cho công nhân học)..."
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 outline-none focus:border-[#E60067]"
          />
        </div>

        <div className="grid gap-2 rounded-lg border border-pink-200 bg-white/80 p-2.5 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-[10px] font-bold text-slate-600">
              Tiêu đề tài liệu Slide:
            </span>
            <input
              type="text"
              value={form.slidePdfTitle}
              onChange={(e) => set('slidePdfTitle', e.target.value)}
              placeholder="VD: Slide Cẩm nang An toàn Số"
              className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-slate-900 outline-none focus:border-[#E60067]"
            />
          </div>
          <div>
            <span className="mb-1 block text-[10px] font-bold text-slate-600">
              File PDF slide (tải lên hoặc dán URL):
            </span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSlidePdfFile(file);
                if (file) setSlidePdfName(file.name);
              }}
              className="w-full text-[11px] text-slate-600"
            />
            {slidePdfName && (
              <p className="mt-0.5 truncate text-[10px] font-bold text-emerald-600">
                {slidePdfName}
              </p>
            )}
          </div>
        </div>

        <SlideEditorList
          value={form.slides}
          onChange={(slides) => set('slides', slides)}
        />
        <p className="text-[10px] font-bold text-pink-700">
          {slideCount} slide đã thêm — học viên sẽ xem dạng trình chiếu ở Phần 1.
        </p>
      </div>

      {/* ─── Phần 2 ─── */}
      <div className="space-y-2.5 rounded-xl border border-teal-200 bg-teal-50/70 p-3.5">
        <div className="flex items-center gap-1.5 font-extrabold text-teal-800">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-700 text-[10px] text-white">
            2
          </span>
          <span>Phần 2: Mô Phỏng Tình Huống (Video &amp; Đúng/Sai)</span>
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-800">
            URL Theme Video mô phỏng tình huống thực tế (YouTube)
          </label>
          <input
            type="text"
            value={form.simulation.videoUrl}
            onChange={(e) => setNested('simulation', { videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 outline-none focus:border-teal-600"
          />
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-800">
            Mô tả bối cảnh tình huống trong video
          </label>
          <textarea
            rows={2}
            value={form.simulation.description}
            onChange={(e) => setNested('simulation', { description: e.target.value })}
            placeholder="VD: Chị Lan nhận cuộc gọi trúng thưởng..."
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 outline-none focus:border-teal-600"
          />
        </div>

        <div className="grid gap-2 rounded-lg border border-teal-200 bg-white/80 p-2.5 sm:grid-cols-[1fr_130px]">
          <div>
            <span className="mb-1 block text-[10px] font-bold text-slate-600">
              Phát biểu Đúng / Sai cho học viên tự kiểm tra
            </span>
            <input
              type="text"
              value={form.simulation.statement}
              onChange={(e) => setNested('simulation', { statement: e.target.value })}
              placeholder="VD: Chị Lan nên nhập mã OTP để nhận thưởng ngay."
              className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-slate-900 outline-none focus:border-teal-600"
            />
          </div>
          <div>
            <span className="mb-1 block text-[10px] font-bold text-slate-600">
              Đáp án
            </span>
            <select
              value={form.simulation.isCorrect ? 'true' : 'false'}
              onChange={(e) =>
                setNested('simulation', { isCorrect: e.target.value === 'true' })
              }
              className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-slate-900 outline-none focus:border-teal-600"
            >
              <option value="false">Sai</option>
              <option value="true">Đúng</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Phần 3 ─── */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
        <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[10px] text-white">
            3
          </span>
          <span>Phần 3: Tóm Tắt Bài Học (Định dạng: PDF Infographic)</span>
        </div>

        <SummaryFormatPicker
          value={form.summary}
          onChange={(summary) => set('summary', summary)}
        />

        <div>
          <span className="mb-1 block text-[10px] font-bold text-slate-600">
            Hoặc tải lên ảnh/poster infographic (nếu có file)
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setSummaryImageFile(e.target.files?.[0] || null)}
            className="w-full text-[11px] text-slate-600"
          />
        </div>
      </div>

      {/* ─── Phần 4 ─── */}
      <div className="space-y-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
        <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] text-white">
            4
          </span>
          <span>Phần 4: Đánh Giá Nội Dung Học (Trắc Nghiệm)</span>
        </div>

        <QuizEditor
          value={form.quiz}
          onChange={(quiz) => set('quiz', quiz)}
        />
        {errors.quiz && (
          <p className="text-[11px] text-rose-600">{errors.quiz}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E60067] py-3 font-extrabold text-white shadow-md transition-all hover:bg-[#c90059] disabled:opacity-50"
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
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        <span>
          {saving
            ? 'Đang lưu...'
            : isEdit
              ? 'Lưu Thay Đổi Bài Học'
              : 'Đăng Bài Học Mới Lên Mini App'}
        </span>
      </button>
    </form>
  );
}
