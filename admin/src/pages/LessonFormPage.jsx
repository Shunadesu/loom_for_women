import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchLessonsByCourseAdmin,
  createLessonAdmin,
  updateLessonAdmin,
} from '../services/lessonApi.js';
import { fetchCourseContent } from '../services/courseIntakeApi.js';
import {
  createLessonDraft,
  lessonToDraft,
  draftToFormData,
  missingParts,
  validateLessonDraft,
} from '../components/lessonDraft.js';
import {
  LESSON_STEPS,
  LESSON_STEP_COMPONENTS,
} from '../components/lesson/LessonSteps.jsx';
import { ArrowLeftIcon, CheckIcon } from '../components/icons.jsx';
import { useNotification } from '../store/notificationStore.js';

/**
 * Trang nhập / sửa 1 bài học — chia 6 bước.
 *
 * Route:
 *   /courses/:courseId/lessons/new           → tạo bài học mới
 *   /courses/:courseId/lessons/:lessonId/edit → sửa bài học đã có
 *
 * Mỗi bước là 1 phần nội dung (thông tin / slide / mô phỏng / tóm tắt /
 * trắc nghiệm / media). Có thể nhảy qua lại tự do, dữ liệu giữ trong 1
 * bản nháp nên không mất khi chuyển bước. Lưu 1 lần ở bất kỳ bước nào.
 */
export default function LessonFormPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { notify, toast } = useNotification();

  const isEdit = Boolean(lessonId);

  const [draft, setDraft] = useState(() => createLessonDraft());
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = LESSON_STEPS;
  const currentStep = steps[stepIndex];
  const StepComponent = LESSON_STEP_COMPONENTS[currentStep.key];

  // Nạp bài học cần sửa (kèm nội dung 4 phần)
  useEffect(() => {
    if (!courseId || !lessonId) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const [lessons, contentData] = await Promise.all([
          fetchLessonsByCourseAdmin(courseId),
          fetchCourseContent(courseId).catch(() => null),
        ]);
        if (cancelled) return;
        const lesson = lessons.find((l) => String(l._id) === String(lessonId));
        if (!lesson) {
          notify({
            type: 'error',
            title: 'Không tìm thấy bài học',
            message: 'Bài học cần sửa không tồn tại.',
          });
          navigate(`/courses/${courseId}/lessons`, { replace: true });
          return;
        }
        const contentMap = new Map(
          (contentData?.items || []).map((item) => [
            String(item._id),
            item.content || null,
          ])
        );
        setDraft(lessonToDraft(lesson, contentMap.get(String(lesson._id))));
      } catch (err) {
        if (cancelled) return;
        notify({
          type: 'error',
          title: 'Tải bài học thất bại',
          message: err?.response?.data?.error || 'Không tải được bài học.',
        });
        navigate(`/courses/${courseId}/lessons`, { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId, navigate, notify]);

  const missing = useMemo(() => missingParts(draft), [draft]);

  /** Bước đã đủ dữ liệu hay chưa (dùng cho dấu ✓ trên stepper). */
  const stepDone = useCallback(
    (step) => {
      if (step.key === 'info') return Boolean(draft.title?.trim());
      if (step.key === 'media') {
        return Boolean(
          draft.videoUrl?.trim() ||
            draft.imageUrl?.trim() ||
            draft.pdfFile ||
            draft.pdfUrl
        );
      }
      return step.partKey ? !missing.includes(step.partKey) : false;
    },
    [draft, missing]
  );

  function goToStep(index) {
    if (index < 0) return;
    if (index >= steps.length) {
      setStepIndex(0);
      return;
    }
    setStepIndex(index);
  }

  async function handleSave() {
    const error = validateLessonDraft(draft);
    if (error) {
      notify({ type: 'warning', title: 'Thiếu thông tin', message: error });
      return;
    }

    setSaving(true);
    try {
      const payload = draftToFormData(draft);
      if (isEdit) {
        await updateLessonAdmin(lessonId, payload);
      } else {
        await createLessonAdmin(courseId, payload);
      }
      toast({
        type: 'success',
        title: 'Lưu thành công',
        message: isEdit
          ? 'Bài học đã được cập nhật.'
          : 'Bài học mới đã được thêm.',
      });
      navigate(`/courses/${courseId}/lessons`);
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

  if (loading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        Đang tải bài học...
      </div>
    );
  }

  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-3">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(`/courses/${courseId}/lessons`)}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#E60067]"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-3 w-3" />
          Quay lại danh sách bài học
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu bài học'}
        </button>
      </div>

      <div>
        <h1 className="text-base font-extrabold text-slate-900">
          {isEdit ? 'Sửa bài học' : 'Thêm bài học'}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Điền từng bước — bạn có thể nhảy qua lại giữa các bước, chỉ lưu 1
          lần khi hoàn tất.
        </p>
      </div>

      {/* ─── Stepper ─── */}
      <div className="rounded-md border border-slate-200 bg-white p-3">
        <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((step, i) => {
            const active = i === stepIndex;
            const done = stepDone(step);
            return (
              <li key={step.key}>
                <button
                  type="button"
                  onClick={() => setStepIndex(i)}
                  title={step.label}
                  className={[
                    'flex w-full items-center gap-1.5 rounded-md border px-2 py-1.5 text-left transition',
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black',
                      active
                        ? 'bg-white text-slate-900'
                        : done
                          ? 'bg-emerald-500 text-white'
                          : `${step.chip} text-white`,
                    ].join(' ')}
                  >
                    {done && !active ? (
                      <CheckIcon aria-hidden="true" className="h-2.5 w-2.5" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="truncate text-[10px] font-bold">
                    {step.short}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ─── Nội dung bước hiện tại ─── */}
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p
            className={[
              'text-[11px] font-extrabold uppercase tracking-wide',
              currentStep.text,
            ].join(' ')}
          >
            Bước {stepIndex + 1}/{steps.length} — {currentStep.label}
          </p>
          {currentStep.partKey && (
            <span
              className={[
                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                missing.includes(currentStep.partKey)
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700',
              ].join(' ')}
            >
              {missing.includes(currentStep.partKey)
                ? 'Chưa đủ dữ liệu'
                : 'Đã đủ dữ liệu'}
            </span>
          )}
        </div>

        {/* Thời lượng nằm ở bước "Thông tin" nên bước Slide không hiện lại */}
        <StepComponent
          value={draft}
          onChange={setDraft}
          showDuration={false}
        />
      </div>

      {/* ─── Điều hướng bước ─── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => goToStep(stepIndex - 1)}
          disabled={stepIndex === 0}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Trước
        </button>
        <button
          type="button"
          onClick={() => goToStep(stepIndex + 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
        >
          {stepIndex === steps.length - 1 ? 'Về bước đầu' : 'Tiếp'}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/courses/${courseId}/lessons`)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-primary-600 px-4 py-1.5 text-[11px] font-bold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu bài học'}
          </button>
        </div>
      </div>
    </div>
  );
}
