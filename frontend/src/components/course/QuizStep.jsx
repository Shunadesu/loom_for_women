import { useEffect, useMemo, useState } from 'react';
import {
  submitQuizAnswers,
  fetchLessonQuizAnswers,
} from '../../services/quizApi.js';
import { extractYoutubeId } from '../../utils/youtube.js';

/**
 * Phần 4 — Đánh giá nội dung học (Trắc nghiệm).
 *
 * Luồng: người học điền đáp án cho TẤT CẢ câu, sau đó nộp 1 lần duy nhất.
 * Backend chấm cả bài trong 1 request (POST .../quiz/submit) rồi trả về kết
 * quả từng câu kèm đáp án đúng + giải thích.
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
  // đáp án đã chọn theo quizId (chưa nộp)
  const [selected, setSelected] = useState({});
  // kết quả chấm theo quizId (sau khi nộp)
  const [results, setResults] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Đã nộp cả bài hay chưa — sau khi nộp thì không sửa lại đáp án được nữa.
  const [submitted, setSubmitted] = useState(false);
  // Khách (chưa đăng nhập) đã nộp đáp án — hiện CTA nhắc đăng nhập để lưu tiến độ.
  const [guestMode, setGuestMode] = useState(false);
  // Số liệu tổng hợp do backend trả về (số câu đúng / tổng số câu)
  const [serverCorrect, setServerCorrect] = useState(null);
  const [serverAllCorrect, setServerAllCorrect] = useState(null);
  // Toàn bộ đáp án của bài học (đáp án đúng + giải thích) để người học theo dõi
  const [allAnswers, setAllAnswers] = useState([]);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const current = list[index] || null;
  const currentId = current?._id ? String(current._id) : '';
  const currentResult = currentId ? results[currentId] : null;
  const total = list.length;

  /** Số câu đã chọn đáp án (trước khi nộp) hoặc đã chấm (sau khi nộp). */
  const answeredCount = submitted
    ? Object.keys(results).length
    : Object.keys(selected).length;
  const correctCount = Object.values(results).filter((r) => r?.isCorrect).length;

  /** Số câu đã trả lời đúng / tổng số câu (dùng số liệu từ server nếu có). */
  const correctTotal = serverCorrect ?? correctCount;
  const allCorrect = serverAllCorrect ?? (total > 0 && correctCount === total);
  /** Đã điền đủ đáp án chưa — chỉ khi đủ mới cho nộp. */
  const allAnswered = answeredCount >= total && total > 0;

  useEffect(() => {
    setIndex(0);
    setSelected({});
    setResults({});
    setError('');
    setSubmitted(false);
    setGuestMode(false);
    setServerCorrect(null);
    setServerAllCorrect(null);
    setAllAnswers([]);
    setShowAllAnswers(false);
  }, [lessonId]);

  /**
   * Tải toàn bộ đáp án của bài học (đáp án đúng + giải thích).
   * Gọi sau khi người học đã nộp đáp án → không làm lộ đáp án sớm.
   */
  async function loadAllAnswers() {
    if (!lessonId || allAnswers.length > 0 || answersLoading) return;
    setAnswersLoading(true);
    try {
      const data = await fetchLessonQuizAnswers(lessonId);
      setAllAnswers(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setAllAnswers([]);
    } finally {
      setAnswersLoading(false);
    }
  }

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

  /** Nộp toàn bộ đáp án 1 lần — backend chấm cả bài rồi trả kết quả từng câu. */
  async function handleSubmitAll() {
    if (!allAnswered || submitting) return;

    const answers = list
      .map((q) => {
        const qid = q?._id ? String(q._id) : '';
        const answer = selected[qid];
        return answer ? { quizId: qid, answer } : null;
      })
      .filter(Boolean);

    setSubmitting(true);
    setError('');
    try {
      const res = await submitQuizAnswers(lessonId, answers, true);

      const map = {};
      (res?.results || []).forEach((r) => {
        if (r?.quizId) map[String(r.quizId)] = r;
      });
      setResults(map);
      setSubmitted(true);

      // Đã nộp → tải toàn bộ đáp án của bài học để người học theo dõi.
      // Không cần đăng nhập (endpoint public) → khách cũng xem được ngay.
      loadAllAnswers();
      setShowAllAnswers(true);

      if (res?.guest) {
        // Khách: backend chỉ chấm, không lưu attempt/điểm/tiến độ.
        setGuestMode(true);
        return;
      }

      if (typeof res?.correctQuizzes === 'number') {
        setServerCorrect(res.correctQuizzes);
      }
      if (typeof res?.allCorrect === 'boolean') {
        setServerAllCorrect(res.allCorrect);
      }
      // Bài học chỉ hoàn thành khi trả lời đúng TẤT CẢ câu.
      // Dù đúng lẻ hay đủ cả bài, điểm quiz vẫn đã cộng ở backend →
      // đồng bộ tổng điểm mới lên header ngay (tránh kẹt ở 0).
      if (!res?.guest && typeof res?.totalPoints === 'number') {
        try {
          const { useProgressStore } = await import('../../store/progressStore.js');
          useProgressStore.getState().syncPoints(res.totalPoints);
        } catch (_) {}
      }
      if (res?.allCorrect && onPassed) {
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
              Câu {index + 1}/{total} • Đã trả lời {answeredCount}/{total}
              {submitted ? ` • Đúng ${correctTotal}/${total}` : ''}
            </p>
            {!submitted && (
              <p className="mt-0.5 text-[10px] font-bold text-amber-600">
                Điền đủ {total} câu rồi nộp 1 lần. Trả lời đúng tất cả {total} câu
                để hoàn thành bài học.
              </p>
            )}
            {submitted && total > 1 && !allCorrect && (
              <p className="mt-0.5 text-[10px] font-bold text-amber-600">
                Trả lời đúng tất cả {total} câu để hoàn thành bài học.
              </p>
            )}
            {submitted && total > 1 && allCorrect && !guestMode && (
              <p className="mt-0.5 text-[10px] font-bold text-emerald-600">
                Đã trả lời đúng đủ {total} câu — bài học đã hoàn thành.
              </p>
            )}
            {submitted && total > 1 && allCorrect && guestMode && (
              <p className="mt-0.5 text-[10px] font-bold text-amber-600">
                Bạn đã trả lời đúng đủ {total} câu. Xem toàn bộ đáp án bên dưới
                để ôn lại nhé.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nhắc đăng nhập khi đang làm ở chế độ khách */}
      {!isAuthenticated && (
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex items-start gap-2">
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
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <p className="text-[11px] leading-relaxed text-amber-900">
              Đang xem trước — bạn vẫn xem được toàn bộ đáp án, nhưng kết quả
              không được lưu. Đăng nhập để lưu tiến độ và nhận điểm.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRequireLogin?.()}
            className="shrink-0 cursor-pointer rounded-xl bg-[#E60067] px-3.5 py-1.5 text-[11px] font-extrabold text-white shadow-sm transition-colors hover:bg-[#c90059]"
          >
            Đăng nhập
          </button>
        </div>
      )}

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
            const isAnswer = currentResult?.correctAnswer === key;
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
                disabled={submitted}
                onClick={() =>
                  setSelected((prev) => ({ ...prev, [currentId]: key }))
                }
                className={`flex w-full items-start gap-2.5 rounded-xl p-3 text-left text-xs font-medium leading-relaxed transition-all ${cls} ${
                  submitted ? 'cursor-default' : 'cursor-pointer'
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

        {/* Kết quả câu hiện tại (chỉ hiện sau khi nộp cả bài) */}
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
            {guestMode && (
              <button
                type="button"
                onClick={() => {
                  setShowAllAnswers(true);
                  loadAllAnswers();
                }}
                className="mt-2 cursor-pointer rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[10px] font-extrabold text-amber-700 shadow-sm transition-colors hover:bg-amber-50"
              >
                Xem toàn bộ đáp án
              </button>
            )}
          </div>
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
              const picked = Boolean(selected[qid]);
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
                        ? res.isCorrect
                          ? 'w-2 bg-emerald-500'
                          : 'w-2 bg-rose-400'
                        : picked
                          ? 'w-2 bg-amber-400'
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

      {/* ─── Nút nộp toàn bộ bài (1 lần) ─── */}
      {!submitted && (
        <div className="sticky bottom-0 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] font-bold text-slate-600">
              {allAnswered
                ? `Đã điền đủ ${total} câu. Sẵn sàng nộp bài.`
                : `Còn ${total - answeredCount} câu chưa chọn đáp án.`}
            </p>
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={!allAnswered || submitting}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#E60067] to-rose-600 px-5 py-3 text-xs font-extrabold text-white shadow-md transition-all hover:from-pink-600 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {submitting ? 'Đang chấm...' : 'Nộp đáp án'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Bảng toàn bộ đáp án (để người học theo dõi) ─── */}
      {showAllAnswers && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-black text-slate-900">
              Toàn bộ đáp án bài học
            </h4>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">
                Đúng {correctTotal}/{total}
              </span>
              <button
                type="button"
                onClick={() => setShowAllAnswers(false)}
                className="cursor-pointer rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Ẩn
              </button>
            </div>
          </div>

          {answersLoading && (
            <p className="mt-3 text-[11px] font-bold text-slate-500">
              Đang tải đáp án...
            </p>
          )}

          {!answersLoading && allAnswers.length === 0 && (
            <p className="mt-3 text-[11px] font-bold text-slate-500">
              Chưa tải được danh sách đáp án.
            </p>
          )}

          <div className="mt-3 space-y-3">
            {allAnswers.map((item, ai) => {
              const qid = item?._id ? String(item._id) : '';
              const picked = qid ? selected[qid] : null;
              const res = qid ? results[qid] : null;
              const itemOptions = item?.options || {};
              const keys =
                item?.type === 'true_false'
                  ? ['A', 'B']
                  : ['A', 'B', 'C', 'D'];
              const isAnswered = Boolean(res);
              const isRight = Boolean(res?.isCorrect);

              return (
                <div
                  key={qid || ai}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-black text-white">
                      {ai + 1}
                    </span>
                    <p className="flex-1 text-xs font-bold leading-relaxed text-slate-900">
                      {item?.question}
                    </p>
                    {isAnswered ? (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                          isRight
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isRight ? 'Đúng' : 'Sai'}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-extrabold uppercase text-slate-500">
                        Chưa trả lời
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {keys.map((key) => {
                      const isCorrect = item?.correct === key;
                      const isPicked = picked === key;
                      let cls =
                        'border border-slate-200 bg-white text-slate-600';
                      if (isCorrect) {
                        cls = 'border-emerald-300 bg-emerald-50 text-emerald-900';
                      } else if (isPicked) {
                        cls = 'border-rose-300 bg-rose-50 text-rose-900';
                      }
                      return (
                        <div
                          key={key}
                          className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] leading-relaxed ${cls}`}
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-black text-slate-700 ring-1 ring-slate-200">
                            {key}
                          </span>
                          <span className="flex-1">
                            {itemOptions[key] || `Lựa chọn ${key}`}
                          </span>
                          {isCorrect && (
                            <span className="shrink-0 text-[9px] font-extrabold uppercase text-emerald-700">
                              Đáp án đúng
                            </span>
                          )}
                          {isPicked && !isCorrect && (
                            <span className="shrink-0 text-[9px] font-extrabold uppercase text-rose-700">
                              Bạn chọn
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {item?.explain && (
                    <p className="mt-2 rounded-lg bg-white px-2.5 py-2 text-[11px] leading-relaxed text-slate-700">
                      {item.explain}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
