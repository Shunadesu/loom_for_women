import { useEffect, useMemo, useState } from 'react';
import { resolveImageUrl } from '../../utils/imageUrl.js';
import {
  speak,
  stopSpeaking,
  isSpeechSupported,
  buildSlideSpeech,
} from '../../utils/speech.js';

/**
 * Trình xem slide (Phần 1 — Cung cấp kiến thức).
 *
 * Props:
 * - slides      : array slide
 * - lessonTitle : tiêu đề bài học (hiển thị trên header slide)
 * - pdfUrl      : URL file PDF slide để tải về
 * - pdfTitle    : tên hiển thị của file PDF
 */
export default function SlideViewer({
  slides = [],
  lessonTitle = '',
  pdfUrl = '',
  pdfTitle = '',
}) {
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const list = useMemo(() => (Array.isArray(slides) ? slides : []), [slides]);
  const current = list[index] || null;
  const total = list.length;

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  // Dừng đọc khi rời component hoặc đổi slide
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    stopSpeaking();
    setSpeaking(false);
  }, [index]);

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/50 p-6 text-center">
        <p className="text-xs font-bold text-slate-700">
          Bài học này chưa có slide kiến thức.
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Học viên vẫn có thể xem các nội dung khác của bài học.
        </p>
      </div>
    );
  }

  const handleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const text = buildSlideSpeech(current);
    const started = speak(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
    if (!started) setSpeaking(false);
  };

  const go = (next) => {
    if (next < 0 || next >= total) return;
    setIndex(next);
  };

  return (
    <div className="space-y-4">
      {/* Header bài học */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-pink-200 bg-pink-50 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E60067] text-sm font-bold text-white shadow-sm">
            1
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E60067]">
              Phần 1 • Cung cấp kiến thức
            </span>
            <h3 className="mt-0.5 text-sm font-black text-slate-900">
              Trình Chiếu Slide Bài Giảng: {current?.title || lessonTitle}
            </h3>
            {current?.content && (
              <p className="mt-0.5 text-[11px] text-slate-600">{current.content}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          {current?.durationSeconds > 0 && (
            <span className="rounded-full border border-pink-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-500">
              ⏱️ Thời lượng: {formatClock(current.durationSeconds)}
            </span>
          )}
        </div>
      </div>

      {/* Khung slide */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm p-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded-lg bg-pink-100 px-2.5 py-1 text-xs font-extrabold text-[#E60067]">
              Slide {index + 1} / {total}
            </span>
            <h4 className="max-w-xs truncate text-xs font-extrabold text-slate-900 sm:max-w-md">
              {current?.title}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {isSpeechSupported() && (
              <button
                type="button"
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all ${
                  speaking
                    ? 'border-teal-300 bg-teal-100 text-teal-800'
                    : 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
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
                  <path
                    d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 0 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
                  />
                  <path d="M16 9a5 5 0 0 1 0 6" />
                  <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
                </svg>
                <span>{speaking ? 'Dừng đọc' : 'Nghe thuyết minh'}</span>
              </button>
            )}
            {pdfUrl && (
              <a
                href={resolveImageUrl(pdfUrl)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-100"
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
                  className="h-3.5 w-3.5 text-slate-500"
                  aria-hidden="true"
                >
                  <path d="M12 15V3" />
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5" />
                </svg>
                <span className="hidden sm:inline">
                  Tải Slide{pdfTitle ? `: ${pdfTitle}` : ''}
                </span>
                <span className="sm:hidden">Tải</span>
              </a>
            )}
          </div>
        </div>

        {/* Nội dung slide */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-5 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-pink-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-teal-600/20 blur-3xl" />

          <div className="relative z-10 space-y-1 border-b border-slate-700/80 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                Chuyên đề: {lessonTitle || 'Khóa học'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Trang {index + 1}/{total}
              </span>
            </div>
            <h3 className="text-base font-black tracking-tight text-white sm:text-xl">
              {current?.title}
            </h3>
          </div>

          <div className="relative z-10 my-4 grid grid-cols-1 items-center gap-5 md:grid-cols-12">
            <div className="space-y-3 md:col-span-7">
              {(current?.bullets || [])
                .filter(Boolean)
                .map((bullet, bi) => (
                  <div
                    key={bi}
                    className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
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
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <p className="text-xs font-medium leading-relaxed text-slate-200 sm:text-sm">
                      {bullet}
                    </p>
                  </div>
                ))}

              {current?.note && (
                <div className="mt-3 flex items-start gap-2 rounded-r-xl border-l-4 border-amber-400 bg-amber-400/15 p-3">
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
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                    aria-hidden="true"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase text-amber-300">
                      {current.noteLabel || 'LƯU Ý'}
                    </span>
                    <p className="mt-0.5 text-xs leading-relaxed text-amber-200">
                      {current.note}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center md:col-span-5">
              {current?.imageUrl ? (
                <div className="relative w-full overflow-hidden rounded-2xl border-2 border-white/10 bg-slate-950/40 p-2">
                  <img
                    alt={current.title}
                    src={resolveImageUrl(current.imageUrl)}
                    className="mx-auto max-h-[420px] w-auto rounded-xl object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-pink-200 backdrop-blur-sm">
                    Minh họa thực tế
                  </span>
                </div>
              ) : (
                <div className="flex min-h-[200px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-white/10 text-[11px] text-slate-400">
                  Chưa có ảnh minh hoạ cho slide này
                </div>
              )}
            </div>
          </div>

          {/* Điều hướng */}
          <div className="relative z-10 flex items-center justify-between border-t border-slate-700/80 pt-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-bold transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
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
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Slide trước</span>
            </button>

            <div className="flex items-center gap-1.5">
              {list.map((s, si) => (
                <button
                  key={si}
                  type="button"
                  onClick={() => go(si)}
                  aria-label={`Đi tới Slide ${si + 1}`}
                  className={`h-2 cursor-pointer rounded-full transition-all ${
                    si === index ? 'w-6 bg-[#E60067]' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={index === total - 1}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#E60067] px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#c90059] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Slide tiếp</span>
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
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Lưới danh sách slide */}
        <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
          {list.map((s, si) => (
            <button
              key={si}
              type="button"
              onClick={() => go(si)}
              className={`rounded-xl border p-2.5 text-left transition-all ${
                si === index
                  ? 'border-[#E60067] bg-pink-50/70 shadow-xs ring-1 ring-[#E60067]/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>Slide {si + 1}</span>
                {si === index && (
                  <span className="text-[9px] font-black text-[#E60067]">Đang xem</span>
                )}
              </div>
              <p className="line-clamp-1 text-[11px] font-extrabold text-slate-800">
                {s.title}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatClock(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m > 0 && r > 0) return `${m}:${String(r).padStart(2, '0')}`;
  if (m > 0) return `${m}:00`;
  return `${r}s`;
}
