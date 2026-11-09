import { useEffect, useMemo, useState } from 'react';
import { submitQuizAnswer } from '../../services/quizApi.js';
import { extractYoutubeId } from '../../utils/youtube.js';

/**
 * Phần 4 — Đánh giá nội dung học (Trắc nghiệm).
 *
 * Props:
 * - quizzes    : array câu hỏi (không có đáp án đúng — backend tự chấm)
 * - lessonId   : id bài học (dùng để nộp đáp án)
 * - isAuthenticated
 * - onRequireLogin : callback khi học viên chưa đăng nhập
 * - onPassed   : callback(result) khi trả lời đúng (dùng để cập nhật tiến độ)
 */
export default function QuizStep({
  quizzes = [],
  lessonId,
  isAuthenticated = false,
  onRequireLogin,
  onPassed,
}) {
  const list = useMemo(() => (Array.isArray(quizzes) ? quizzes : []), [quizzes]);

  // index câu hỏi hiện tại
  const [index, setIndex] = useState(0);
  // đáp án đã chọn theo quizId
  const [selected, setSelected] = useState({});
  // kết quả chấm theo quizId
  const [results, setResults] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Số liệu tổng hợp do backend trả về (số câu đúng / tổng số câu)
  const [serverCorrect, setServerCorrect] = useState(null);
  const [serverAllCorrect, setServerAllCorrect] = useState(null);

  const current = list[index] || null;
  const currentId = current?._id ? String(current._id) : '';
  const currentResult = currentId ? results[currentId] : null;
  const answeredCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter((r) => r?.isCorrect).length;
  const total = list.length;

  /** Số câu đã trả lời đúng / tổng số câu (dùng số liệu từ server nếu có). */
  const correctTotal = serverCorrect ?? correctCount;
  const allCorrect = serverAllCorrect ?? (total > 0 && correctCount === total);

  useEffect(() => {
    setIndex(0);
    setSelected({});
    setResults({});
    setError('');
    setServerCorrect(null);
    setServerAllCorrect(null);
  }, [lessonId]);

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-6 text-center">
        <p className="text-xs font-bold text-slate-700">
          Bài học này chưa có câu hỏi trắc nghiệm.
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Bạn vẫn có thể đánh dấu hoàn thành bài học ở bước cuối.
        </p>
      </div>
    );
  }

  async function handleSubmit() {
    if (!current) return;
    if (!isAuthenticated) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    const answer = selected[currentId];
    if (!answer) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await submitQuizAnswer(lessonId, currentId, answer, true);
      setResults((prev) => ({ ...prev, [currentId]: res }));
      if (typeof res?.correctQuizzes === 'number') {
        setServerCorrect(res.correctQuizzes);
      }
      if (typeof res?.allCorrect === 'boolean') {
        setServerAllCorrect(res.allCorrect);
      }
      // Bài học chỉ hoàn thành khi trả lời đúng TẤT CẢ câu.
      // Backend trả về allCorrect; với bài 1 câu thì đúng 1 câu là xong.
      const lessonCompleted =
        typeof res?.allCorrect === 'boolean'
          ? res.allCorrect
          : Boolean(res?.isCorrect);
      if (lessonCompleted && onPassed) {
        onPassed(res);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        if (onRequireLogin) onRequireLogin();
      } else {
        setError(
          err?.response?.data?.error || 'Không chấm được câu trả lời. Vui lòng thử lại.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function go(next) {
    if (next < 0 || next >= list.length) return;
    setIndex(next);
    setError('');
  }

  const options = current?.options || {};
  const optionKeys =
    current?.type === 'true_false' ? ['A', 'B'] : ['A', 'B', 'C', 'D'];
  const chosen = currentId ? selected[currentId] : null;

  return (
    <div className="space-y-4">
      {/* Header phần 4 */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-sm font-bold text-white shadow-sm">
            4
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
              Phần 4 • Đánh giá nội dung học
            </span>
            <h3 className="mt-0.5 text-sm font-black text-slate-900">
              Trắc Nghiệm Tổng Kết
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Câu {index + 1}/{total} • Đã trả lời {answeredCount} • Đúng{' '}
              {correctTotal}/{total}
            </p>
            {total > 1 && !allCorrect && (
              <p className="mt-0.5 text-[10px] font-bold text-amber-600">
                Trả lời đúng tất cả {total} câu để hoàn thành bài học.
              </p>
            )}
            {total > 1 && allCorrect && (
              <p className="mt-0.5 text-[10px] font-bold text-emerald-600">
                Đã trả lời đúng đủ {total} câu — bài học đã hoàn thành.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Video tình huống (nếu có) */}
      {current?.videoUrl && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
          <div className="aspect-video w-full">
            <iframe
              src={
                extractYoutubeId(current.videoUrl)
                  ? `https://www.youtube.com/embed/${extractYoutubeId(
                      current.videoUrl
                    )}?rel=0`
                  : current.videoUrl
              }
              title="Video tình huống trắc nghiệm"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          {current.videoDescription && (
            <p className="bg-slate-900 px-3 py-2 text-[11px] leading-relaxed text-slate-200">
              {current.videoDescription}
            </p>
          )}
        </div>
      )}

      {/* Câu hỏi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm font-bold leading-relaxed text-slate-900">
          {current?.question}
        </p>

        <div className="mt-3 space-y-2">
          {optionKeys.map((key) => {
            const isChosen = chosen === key;
            const isAnswer =
              currentResult?.correctAnswer === key;
            const isWrongPick =
              currentResult && isChosen && !currentResult.isCorrect;
            let cls =
              'border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100';
            if (currentResult) {
              if (isAnswer) cls = 'border-emerald-300 bg-emerald-50 text-emerald-900';
              else if (isWrongPick) cls = 'border-rose-300 bg-rose-50 text-rose-900';
              else cls = 'border-slate-200 bg-slate-50 text-slate-500';
            } else if (isChosen) {
              cls = 'border-[#E60067] bg-pink-50 text-slate-900';
            }
            return (
              <button
                key={key}
                type="button"
                disabled={Boolean(currentResult)}
                onClick={() =>
                  setSelected((prev) => ({ ...prev, [currentId]: key }))
                }
                className={`flex w-full items-start gap-2.5 rounded-xl p-3 text-left text-xs font-medium leading-relaxed transition-all ${cls} ${
                  currentResult ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black text-slate-700 ring-1 ring-slate-200">
                  {key}
                </span>
                <span className="flex-1">{options[key] || `Lựa chọn ${key}`}</span>
                {currentResult && isAnswer && (
                  <span className="shrink-0 text-[10px] font-extrabold uppercase text-emerald-700">
                    Đáp án đúng
                  </span>
                )}
                {isWrongPick && (
                  <span className="shrink-0 text-[10px] font-extrabold uppercase text-rose-700">
                    Bạn chọn
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-2 text-[11px] font-bold text-rose-600">{error}</p>
        )}

        {currentResult && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-xl border p-3 ${
              currentResult.isCorrect
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
                currentResult.isCorrect ? 'text-emerald-600' : 'text-amber-600'
              }`}
              aria-hidden="true"
            >
              {currentResult.isCorrect ? (
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
                  currentResult.isCorrect ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {currentResult.isCorrect
                  ? 'Chính xác!'
                  : 'Chưa đúng — xem lại phần trên nhé'}
              </span>
              {currentResult.explain && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-700">
                  {currentResult.explain}
                </p>
              )}
            </div>
          </div>
        )}

        {!currentResult && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!chosen || submitting}
            className="mt-3 w-full rounded-xl bg-[#E60067] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-[#c90059] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Đang chấm...' : 'Nộp đáp án'}
          </button>
        )}

        {/* Điều hướng câu hỏi */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Câu trước
          </button>
          <div className="flex items-center gap-1.5">
            {list.map((q, qi) => {
              const qid = q?._id ? String(q._id) : '';
              const res = results[qid];
              return (
                <button
                  key={qid || qi}
                  type="button"
                  onClick={() => go(qi)}
                  aria-label={`Tới câu ${qi + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    qi === index
                      ? 'w-6 bg-[#E60067]'
                      : res
                        ? 'w-2 bg-emerald-500'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === list.length - 1}
            className="rounded-xl bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Câu sau
          </button>
        </div>
      </div>
    </div>
  );
}
