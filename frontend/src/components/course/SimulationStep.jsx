import { useMemo, useState } from 'react';
import { extractYoutubeId } from '../../utils/youtube.js';

/**
 * Phần 2 — Mô phỏng tình huống (Video & Đúng/Sai).
 *
 * Props:
 * - simulation : object { videoUrl, youtubeId, description, statements: [{ text, isCorrect }] }
 *                (hỗ trợ dữ liệu cũ: statement + isCorrect)
 */

/** Chuẩn hoá danh sách phát biểu — dữ liệu mới `statements[]`, dữ liệu cũ `statement`. */
function toStatements(sim) {
  const list = Array.isArray(sim?.statements) ? sim.statements : [];
  const mapped = list
    .map((s) => ({
      text: String(s?.text ?? '').trim(),
      isCorrect: s?.isCorrect !== false,
    }))
    .filter((s) => s.text);
  if (mapped.length > 0) return mapped;
  const legacyText = String(sim?.statement ?? '').trim();
  if (!legacyText) return [];
  return [{ text: legacyText, isCorrect: sim?.isCorrect !== false }];
}

export default function SimulationStep({ simulation }) {
  // Lựa chọn của học viên theo chỉ số phát biểu: { 0: true, 1: false, ... }
  const [choices, setChoices] = useState({});

  const sim = simulation || null;
  const statements = useMemo(() => toStatements(sim), [sim]);
  const videoId = useMemo(
    () => sim?.youtubeId || extractYoutubeId(sim?.videoUrl) || '',
    [sim?.youtubeId, sim?.videoUrl]
  );
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0`
    : sim?.videoUrl || '';

  if (!sim || (!sim.videoUrl && !sim.description && statements.length === 0)) {
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

  const total = statements.length;
  const answered = statements.filter((_, i) => choices[i] !== undefined).length;
  const correctCount = statements.filter(
    (s, i) => choices[i] !== undefined && choices[i] === s.isCorrect
  ).length;

  const choose = (index, value) => {
    setChoices((prev) => ({ ...prev, [index]: value }));
  };

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
            {total > 0 && (
              <p className="mt-0.5 text-[11px] font-bold text-teal-700">
                Đã trả lời {answered}/{total} • Đúng {correctCount}/{total}
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

      {/* Danh sách bài kiểm tra đúng/sai */}
      {total > 0 && (
        <div className="space-y-3">
          {statements.map((st, i) => {
            const chosen = choices[i];
            const isAnswered = chosen !== undefined;
            const isCorrect = isAnswered && chosen === st.isCorrect;

            return (
              <div
                key={`statement-${i}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[10px] font-black text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
                      Tự kiểm tra hiểu bài
                    </span>
                    <p className="mt-1.5 text-sm font-bold leading-relaxed text-slate-900">
                      {st.text}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 sm:pl-7">
                  <button
                    type="button"
                    onClick={() => choose(i, true)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                      chosen === true
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
                    onClick={() => choose(i, false)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                      chosen === false
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

                {isAnswered && (
                  <div
                    className={`mt-3 flex items-start gap-2 rounded-xl border p-3 sm:ml-7 ${
                      isCorrect
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
                        isCorrect ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                      aria-hidden="true"
                    >
                      {isCorrect ? (
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
                          isCorrect ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {isCorrect ? 'Chính xác!' : 'Chưa đúng'}
                      </span>
                      <p
                        className={`mt-0.5 text-xs leading-relaxed ${
                          isCorrect ? 'text-emerald-800' : 'text-amber-800'
                        }`}
                      >
                        Đáp án đúng là{' '}
                        <strong>{st.isCorrect ? 'Đúng' : 'Sai'}</strong>. Hãy xem
                        lại video và bối cảnh để nắm rõ cách xử lý tình huống
                        thực tế.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
