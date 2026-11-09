import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import SlideViewer from './SlideViewer.jsx';
import SimulationStep from './SimulationStep.jsx';
import SummaryStep from './SummaryStep.jsx';
import QuizStep from './QuizStep.jsx';
import { resolveImageUrl } from '../../utils/imageUrl.js';

/**
 * Modal học bài 4 phần (Phần 1 → 4).
 *
 * Props:
 * - open          : mở/đóng modal
 * - onClose       : callback đóng
 * - course        : object khóa học (title, category, rating, durationMinutes...)
 * - lesson        : object bài học (title, slides, simulations, summary, quizzes, slidePdfUrl, slidePdfTitle)
 * - isAuthenticated
 * - onRequireLogin
 * - onPassed      : callback(result) khi học viên trả lời đúng trắc nghiệm
 * - onOpenCertificate : callback mở trang chứng nhận
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
}) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (open) setStep(1);
  }, [open, lesson?._id]);

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

  if (!open || !lesson) return null;

  const canGoNext = (target) => {
    if (target === 2) return slides.length > 0;
    if (target === 3) return simulations.length > 0;
    if (target === 4) return Boolean(summary);
    return true;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="flex h-full max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden bg-white sm:h-[92vh] sm:max-h-[92vh] sm:rounded-2xl sm:shadow-2xl">
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
                onClick={onOpenCertificate}
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

        {/* ─── Thanh 4 bước ─── */}
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-6">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 lg:grid-cols-4">
            {STEPS.map((s) => {
              const active = step === s.key;
              const enabled = canGoNext(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStep(s.key)}
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
                        : 'bg-pink-100 text-[#E60067]'
                    }`}
                  >
                    {s.key}
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
        </div>

        {/* ─── Nội dung ─── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 1 && (
            <div className="space-y-4">
              <SlideViewer
                slides={slides}
                lessonTitle={lesson.knowledgeTitle || lesson.title}
                pdfUrl={lesson.slidePdfUrl || ''}
                pdfTitle={lesson.slidePdfTitle || lesson.slidePdfName || ''}
              />
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
                  onClick={() => setStep(2)}
                  disabled={!canGoNext(2)}
                  className="flex cursor-pointer items-center justify-center gap-2 self-stretch whitespace-nowrap rounded-xl bg-[#E60067] px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#c90059] disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
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

          {step === 2 && (
            <div className="space-y-4">
              <SimulationStep simulation={simulations[0] || null} />
              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900">
                    Đã xem xong tình huống?
                  </span>{' '}
                  Sang phần tóm tắt để nắm trọn kiến thức bài học.
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canGoNext(3)}
                  className="flex cursor-pointer items-center justify-center gap-2 self-stretch whitespace-nowrap rounded-xl bg-[#E60067] px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#c90059] disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
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

          {step === 3 && (
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
                  onClick={() => setStep(4)}
                  disabled={!canGoNext(4)}
                  className="flex cursor-pointer items-center justify-center gap-2 self-stretch whitespace-nowrap rounded-xl bg-[#E60067] px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#c90059] disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
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

          {step === 4 && (
            <QuizStep
              quizzes={quizzes}
              lessonId={lesson._id}
              isAuthenticated={isAuthenticated}
              onRequireLogin={onRequireLogin}
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
                onClick={onOpenCertificate}
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
