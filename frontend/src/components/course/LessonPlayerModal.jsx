import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import SlideViewer from './SlideViewer.jsx';
import SimulationStep from './SimulationStep.jsx';
import SummaryStep from './SummaryStep.jsx';
import QuizStep from './QuizStep.jsx';
import LessonMedia from './LessonMedia.jsx';
import { hasStructuredContent, resolveSlideMode } from '../../utils/lessonParts.js';
import { resolveImageUrl } from '../../utils/imageUrl.js';

// pdf.js khá nặng (~1.4MB) → chỉ tải khi bài học thực sự dùng PDF slide
const SlidePdfViewer = lazy(() => import('./SlidePdfViewer.jsx'));

/**
 * Modal học bài 4 phần (Phần 1 → 4).
 *
 * Props:
 * - open          : mở/đóng modal
 * - onClose       : callback đóng
 * - course        : object khóa học (title, category, rating, durationMinutes...)
 * - lesson        : object bài học (title, slides, simulations, summary, quizzes, slidePdfUrl, slidePdfTitle)
 * - isAuthenticated
 * - onRequireLogin : callback mở LoginDrawer (có thể nhận redirectPath) khi học viên chưa đăng nhập
 * - onPassed      : callback(result) khi học viên trả lời đúng trắc nghiệm
 * - onOpenCertificate : callback mở trang chứng nhận
 * - onComplete    : callback(lessonId) đánh dấu hoàn thành (dùng cho bài học chỉ có media)
 * - isCompleted   : bài học hiện tại đã hoàn thành hay chưa
 */
const STEPS = [
  { key: 1, title: '1. Cung cấp kiến thức', sub: 'Slide bài giảng' },
  { key: 2, title: '2. Mô phỏng tình huống', sub: 'Video & Đúng/Sai' },
  { key: 3, title: '3. Tóm tắt bài học', sub: 'PDF infographic' },
  { key: 4, title: '4. Đánh giá nội dung', sub: 'Trắc nghiệm tổng kết' },
];

export default function LessonPlayerModal({
  open,
  onClose,
  course,
  lesson,
  isAuthenticated = false,
  onRequireLogin,
  onPassed,
  onOpenCertificate,
  onComplete,
  isCompleted = false,
}) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const slides = useMemo(() => lesson?.slides || [], [lesson]);
  const simulations = useMemo(() => lesson?.simulations || [], [lesson]);
  const quizzes = useMemo(() => lesson?.quizzes || [], [lesson]);
  const summary = lesson?.summary || null;

  // Chế độ hiển thị Phần 1: PDF slide (nhúng) hay slide thủ công
  const slideMode = resolveSlideMode(lesson);
  const slidePdfUrl = lesson?.slidePdfUrl || '';
  const usePdfSlides = slideMode === 'pdf' && Boolean(slidePdfUrl);

  /**
   * Mỗi bước mở được nếu phần đó CÓ nội dung.
   * Nếu thiếu, hiển thị empty-state tiếng Việt thay vì khóa người học.
   */
  const stepHasContent = {
    1: slides.length > 0 || usePdfSlides,
    2: simulations.length > 0,
    3: Boolean(summary && (summary.imageUrl || summary.pdfUrl || summary.videoUrl)),
    4: quizzes.length > 0,
  };

  // Các phần bắt buộc phải xem để tính hoàn thành bài học (thường là cả 4).
  const requiredSteps = useMemo(
    () => [1, 2, 3, 4].filter((k) => stepHasContent[k]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slides.length, simulations.length, quizzes.length, summary, usePdfSlides]
  );

  // ─── Tiến trình theo 4 phần ───
  // Chỉ học viên ĐÃ ĐĂNG NHẬP mới có tiến trình; khách vẫn học bình thường
  // nhưng không ghi nhớ phần đã xem và không tính hoàn thành.
  const [visitedSteps, setVisitedSteps] = useState(() => new Set());
  // Mirror của visitedSteps để ghi localStorage đồng bộ.
  const visitedRef = useRef(new Set());
  const completedNotifiedRef = useRef(false);

  const storageKey = lesson?._id ? `loom-parts:${lesson._id}` : '';

  // Đọc phần đã xem từ localStorage (chỉ dành cho học viên đã đăng nhập).
  const readVisitedSteps = useCallback(() => {
    if (!isAuthenticated || !storageKey) return [];
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(Number).filter((n) => [1, 2, 3, 4].includes(n));
    } catch {
      return [];
    }
  }, [isAuthenticated, storageKey]);

  /** Đánh dấu 1 phần đã được xem (chỉ lưu khi đã đăng nhập). */
  const markStepVisited = useCallback(
    (target) => {
      if (!isAuthenticated || !storageKey) return;
      // Dùng ref làm nguồn sự thật để ghi localStorage ngay, không phụ thuộc
      // thời điểm React chạy updater của setState.
      const prev = visitedRef.current;
      if (prev.has(target)) return;
      const next = new Set(prev);
      next.add(target);
      visitedRef.current = next;
      setVisitedSteps(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        /* bỏ qua lỗi localStorage */
      }
    },
    [isAuthenticated, storageKey]
  );

  // Mở modal → nạp lại phần đã xem và nhảy tới phần đầu tiên chưa xem.
  useEffect(() => {
    if (!open) return;
    const stored = readVisitedSteps();
    const storedSet = new Set(stored);
    visitedRef.current = storedSet;
    setVisitedSteps(storedSet);
    completedNotifiedRef.current = false;
    const firstUnseen = [1, 2, 3, 4].find(
      (k) => stepHasContent[k] && !stored.includes(k)
    );
    const target = firstUnseen || 1;
    setStep(target);
    // Phần đang hiển thị cũng được tính là đã xem.
    markStepVisited(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lesson?._id, isAuthenticated, markStepVisited]);

  // Số phần đã xem / tổng số phần bắt buộc (chỉ tính với học viên đã đăng nhập).
  const visitedCount = isAuthenticated
    ? requiredSteps.filter((k) => visitedSteps.has(k)).length
    : 0;
  const allStepsVisited =
    isAuthenticated &&
    requiredSteps.length > 0 &&
    visitedCount === requiredSteps.length;

  // Đủ cả 4 phần → đánh dấu hoàn thành bài học (ghi tiến độ lên backend).
  useEffect(() => {
    if (!allStepsVisited || isCompleted) return;
    if (completedNotifiedRef.current) return;
    completedNotifiedRef.current = true;
    onComplete?.(lesson?._id);
  }, [allStepsVisited, isCompleted, onComplete, lesson?._id]);

  if (!open || !lesson) return null;

  // Bài học KHÔNG có nội dung 4 phần → hiển thị media (video/ảnh/PDF) trong modal.
  const structured = hasStructuredContent(lesson);

  // Bước 1 dùng PDF slide → mở rộng modal để trang slide hiển thị to hơn.
  // Bước 3 có PDF infographic cũng dùng trình xem slide → cần rộng tương tự.
  const summaryPdfUrl = summary?.pdfUrl || '';
  const widePdfStep =
    structured &&
    ((step === 1 && usePdfSlides) || (step === 3 && Boolean(summaryPdfUrl)));

  /** Điều hướng tới bước hợp lệ gần nhất (bỏ qua bước không có nội dung). */
  const goToStep = (target) => {
    let next = target;
    // Nếu bước đích không có nội dung → tìm bước gần nhất có nội dung
    if (!stepHasContent[next]) {
      const candidates = [1, 2, 3, 4].filter((k) => stepHasContent[k]);
      if (candidates.length === 0) {
        setStep(target);
        return;
      }
      const forward = candidates.find((k) => k >= target);
      next = forward ?? candidates[candidates.length - 1];
    }
    setStep(next);
    // Đánh dấu phần này đã được xem (chỉ tính với học viên đã đăng nhập).
    markStepVisited(next);
  };

  /**
   * Mở trang chứng chỉ.
   * - Chưa đăng nhập → mở LoginDrawer NGAY TẠI TRANG HIỆN TẠI (không chuyển
   *   trang trước). Sau khi đăng nhập thành công, LoginDrawer sẽ tự chuyển
   *   tới '/chung-chi'.
   * - Đã đăng nhập → điều hướng thẳng tới trang chứng chỉ.
   */
  const handleOpenCertificate = () => {
    if (!isAuthenticated) {
      // Đóng modal bài học trước để LoginDrawer (z-50) không bị modal (z-[9999]) che khuất.
      onClose?.();
      onRequireLogin?.('/chung-chi');
      return;
    }
    onOpenCertificate?.();
  };

  /**
   * Mở drawer đăng nhập từ bên trong modal bài học.
   * LoginDrawer có z-50, modal bài học có z-[9999] → phải đóng modal trước
   * thì drawer mới thấy được (giống handleOpenCertificate).
   * redirectPath '/' → sau khi đăng nhập xong, người dùng ở lại trang hiện tại.
   */
  const handleRequireLogin = () => {
    onClose?.();
    onRequireLogin?.('/');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-0 sm:p-4">
      <div
        className={`flex h-full max-h-[100dvh] w-full flex-col overflow-hidden bg-white sm:h-[92vh] sm:max-h-[92vh] sm:rounded-2xl sm:shadow-2xl ${
          widePdfStep ? 'sm:max-w-7xl' : 'sm:max-w-5xl'
        }`}
      >
        {/* ─── Header ─── */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#E60067] to-[#b8004f] px-3 py-3 sm:px-5">
          {course?.coverUrl || course?.thumbnail ? (
            <img
              src={resolveImageUrl(course.coverUrl || course.thumbnail)}
              alt={course.title}
              className="hidden h-11 w-11 shrink-0 rounded-xl object-cover sm:block"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                {course?.category || 'Khóa học'}
              </span>
              {(course?.rating > 0 || course?.durationMinutes > 0) && (
                <span className="hidden text-[11px] text-pink-100 sm:inline">
                  ⭐ {Number(course?.rating || 0).toFixed(1)}
                  {course?.durationMinutes > 0
                    ? ` • ${course.durationMinutes} phút`
                    : ''}
                </span>
              )}
            </div>
            <h2 className="mt-0.5 truncate text-sm font-extrabold text-white sm:text-base">
              {course?.title || 'Khóa học'}
            </h2>
            <p className="truncate text-[11px] text-pink-100">{lesson.title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onOpenCertificate && (
              <button
                type="button"
                onClick={handleOpenCertificate}
                className="hidden items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs transition-colors hover:bg-amber-300 sm:flex"
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
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
                  <circle cx="12" cy="8" r="6" />
                </svg>
                <span>Chứng nhận</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bài học"
              className="cursor-pointer rounded-full p-1.5 text-white transition-colors hover:bg-white/20"
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
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ─── Thanh 4 bước (chỉ hiện khi bài học có nội dung 4 phần) ─── */}
        {structured && (
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-6">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 lg:grid-cols-4">
              {STEPS.map((s) => {
                const active = step === s.key;
                const enabled = stepHasContent[s.key];
                const visited = isAuthenticated && visitedSteps.has(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => goToStep(s.key)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#E60067] text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                        active
                          ? 'bg-white text-[#E60067]'
                          : visited
                            ? 'bg-emerald-500 text-white'
                            : 'bg-pink-100 text-[#E60067]'
                      }`}
                    >
                      {visited ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        s.key
                      )}
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="truncate font-extrabold leading-tight">
                        {s.title}
                      </p>
                      <span
                        className={`block text-[10px] font-medium ${
                          active ? 'text-pink-100' : 'text-slate-500'
                        }`}
                      >
                        {enabled ? s.sub : 'Chưa có nội dung'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tiến trình 4 phần */}
            <div className="mx-auto mt-2 max-w-5xl">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all duration-500"
                      style={{
                        width: `${
                          requiredSteps.length > 0
                            ? Math.round(
                                (visitedCount / requiredSteps.length) * 100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="shrink-0 text-[11px] font-bold text-slate-600">
                    Đã học {visitedCount}/{requiredSteps.length} phần
                  </span>
                </div>
              ) : (
                <p className="text-center text-[11px] font-medium text-slate-500">
                  Đăng nhập để lưu tiến trình học tập.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── Nội dung ─── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!structured && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-black text-white shadow-sm">
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
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                    Bài học video
                  </span>
                  <h3 className="mt-0.5 truncate text-sm font-black text-slate-900">
                    {lesson.title}
                  </h3>
                </div>
              </div>
              <LessonMedia lesson={lesson} pdfInFrame />
            </div>
          )}
          {structured && step === 1 && (
            <div className="space-y-4">
              {usePdfSlides ? (
                <Suspense
                  fallback={
                    <p className="py-16 text-center text-xs font-bold text-slate-500">
                      Đang tải trình xem PDF slide...
                    </p>
                  }
                >
                  <SlidePdfViewer
                    pdfUrl={resolveImageUrl(slidePdfUrl)}
                    pdfTitle={lesson.slidePdfTitle || lesson.slidePdfName || ''}
                    lessonTitle={lesson.knowledgeTitle || lesson.title}
                  />
                </Suspense>
              ) : (
                <SlideViewer
                  slides={slides}
                  lessonTitle={lesson.knowledgeTitle || lesson.title}
                  pdfUrl={slidePdfUrl}
                  pdfTitle={lesson.slidePdfTitle || lesson.slidePdfName || ''}
                />
              )}
              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900">
                    Đã học xong nội dung Slide?
                  </span>{' '}
                  Chuyển sang phần mô phỏng tình huống thực tế qua Video &amp;
                  Trắc nghiệm Đúng / Sai.
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="flex cursor-pointer items-center justify-center gap-2 self-stretch whitespace-nowrap rounded-xl bg-[#E60067] px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#c90059] sm:self-auto"
                >
                  <span>Chuyển sang Phần 2: Mô phỏng tình huống</span>
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
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {structured && step === 2 && (
            <div className="space-y-4">
              {simulations.map((sim, si) => (
                <SimulationStep
                  key={sim?._id || `simulation-${si}`}
                  simulation={sim || null}
                />
              ))}
              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900">
                    Đã xem xong tình huống?
                  </span>{' '}
                  Sang phần tóm tắt để nắm trọn kiến thức bài học.
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="flex cursor-pointer items-center justify-center gap-2 self-stretch whitespace-nowrap rounded-xl bg-[#E60067] px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#c90059] sm:self-auto"
                >
                  <span>Chuyển sang Phần 3: Tóm tắt bài học</span>
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
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {structured && step === 3 && (
            <div className="space-y-4">
              <SummaryStep summary={summary} />
              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900">
                    Đã nắm trọn kiến thức?
                  </span>{' '}
                  Kiểm tra hiểu bài với câu hỏi trắc nghiệm tổng kết.
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="flex cursor-pointer items-center justify-center gap-2 self-stretch whitespace-nowrap rounded-xl bg-[#E60067] px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#c90059] sm:self-auto"
                >
                  <span>Chuyển sang Phần 4: Đánh giá nội dung học</span>
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
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {structured && step === 4 && (
            <QuizStep
              quizzes={quizzes}
              lessonId={lesson._id}
              isAuthenticated={isAuthenticated}
              onRequireLogin={handleRequireLogin}
              onPassed={onPassed}
            />
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-3.5 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            {onOpenCertificate && (
              <button
                type="button"
                onClick={handleOpenCertificate}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 shadow-xs transition-all hover:bg-emerald-100"
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
                  className="h-4 w-4 text-emerald-600"
                  aria-hidden="true"
                >
                  <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
                  <circle cx="12" cy="8" r="6" />
                </svg>
                <span>GIẤY CHỨNG NHẬN</span>
              </button>
            )}
            {/* Bài học chỉ có media → cho phép đánh dấu hoàn thành ngay trong modal */}
            {!structured && onComplete && !isCompleted && (
              <button
                type="button"
                onClick={() => onComplete(lesson._id)}
                className="cursor-pointer rounded-full bg-teal-600 px-4 py-1.5 text-[11px] font-extrabold text-white transition-colors hover:bg-teal-700"
              >
                Đánh dấu hoàn thành
              </button>
            )}
            {!structured && isCompleted && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-[11px] font-extrabold text-emerald-700">
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
                Đã hoàn thành
              </span>
            )}
            {/* Bài học 4 phần → báo hoàn thành khi đã xem đủ các phần */}
            {structured && isCompleted && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-[11px] font-extrabold text-emerald-700">
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
                Đã hoàn thành
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200"
          >
            Đóng bài học
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
