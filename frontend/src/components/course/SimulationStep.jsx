import { useMemo, useState } from 'react';
import { resolveImageUrl } from '../../utils/imageUrl.js';
import { extractYoutubeId } from '../../utils/youtube.js';

/**
 * Phần 2 — Mô phỏng tình huống (Video & Đúng/Sai).
 *
 * Props:
 * - simulation : object { videoUrl, youtubeId, description, statement, isCorrect }
 */
export default function SimulationStep({ simulation }) {
  const [choice, setChoice] = useState(null); // null | true | false

  const sim = simulation || null;
  const videoId = useMemo(
    () => sim?.youtubeId || extractYoutubeId(sim?.videoUrl) || '',
    [sim?.youtubeId, sim?.videoUrl]
  );
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0`
    : sim?.videoUrl || '';

  if (!sim || (!sim.videoUrl && !sim.description && !sim.statement)) {
    return (
      <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/50 p-6 text-center">
        <p className="text-xs font-bold text-slate-700">
          Bài học này chưa có video mô phỏng tình huống.
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Học viên vẫn có thể xem các nội dung khác của bài học.
        </p>
      </div>
    );
  }

  const answered = choice !== null;
  const correct = answered && choice === Boolean(sim.isCorrect);

  return (
    <div className="space-y-4">
      {/* Header phần 2 */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-sm font-bold text-white shadow-sm">
            2
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
              Phần 2 • Mô phỏng tình huống
            </span>
            <h3 className="mt-0.5 text-sm font-black text-slate-900">
              Video &amp; Trắc Nghiệm Đúng / Sai
            </h3>
            {sim.description && (
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                {sim.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Video mô phỏng */}
      {embedUrl ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title="Video mô phỏng tình huống"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
          Chưa có video mô phỏng cho phần này
        </div>
      )}

      {/* Bài kiểm tra đúng/sai */}
      {sim.statement && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
            Tự kiểm tra hiểu bài
          </span>
          <p className="mt-1.5 text-sm font-bold leading-relaxed text-slate-900">
            {sim.statement}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setChoice(true)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                choice === true
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
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
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Đúng
            </button>
            <button
              type="button"
              onClick={() => setChoice(false)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                choice === false
                  ? 'bg-rose-600 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
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
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              Sai
            </button>
          </div>

          {answered && (
            <div
              className={`mt-3 flex items-start gap-2 rounded-xl border p-3 ${
                correct
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-amber-200 bg-amber-50'
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
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  correct ? 'text-emerald-600' : 'text-amber-600'
                }`}
                aria-hidden="true"
              >
                {correct ? (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </>
                ) : (
                  <>
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </>
                )}
              </svg>
              <div>
                <span
                  className={`block text-[10px] font-extrabold uppercase ${
                    correct ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {correct ? 'Chính xác!' : 'Chưa đúng'}
                </span>
                <p
                  className={`mt-0.5 text-xs leading-relaxed ${
                    correct ? 'text-emerald-800' : 'text-amber-800'
                  }`}
                >
                  Đáp án đúng là{' '}
                  <strong>{sim.isCorrect ? 'Đúng' : 'Sai'}</strong>. Hãy xem lại
                  video và bối cảnh để nắm rõ cách xử lý tình huống thực tế.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
