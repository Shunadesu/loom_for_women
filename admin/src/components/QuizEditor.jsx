/**
 * Chỉnh sửa câu hỏi trắc nghiệm (phần 4 — Đánh giá nội dung học).
 *
 * Props:
 * - value    : { question, options{A,B,C,D}, correct, videoUrl, videoDescription, explain, type }
 * - onChange : (next) => void
 */
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export default function QuizEditor({ value, onChange }) {
  const quiz = value || {};
  const options = quiz.options || { A: '', B: '', C: '', D: '' };
  const type = quiz.type || 'single';

  const patch = (changes) => onChange({ ...quiz, ...changes });

  const setOption = (key, text) => {
    patch({ options: { ...options, [key]: text } });
  };

  const isTrueFalse = type === 'true_false';

  return (
    <div className="space-y-2.5">
      <div className="grid gap-2 sm:grid-cols-[150px_1fr]">
        <div>
          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
            Loại câu hỏi
          </span>
          <select
            value={type}
            onChange={(e) => {
              const nextType = e.target.value;
              if (nextType === 'true_false') {
                patch({
                  type: nextType,
                  options: { A: 'Đúng', B: 'Sai', C: '', D: '' },
                  correct: 'A',
                });
              } else {
                patch({ type: nextType });
              }
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
          >
            <option value="single">Trắc nghiệm A/B/C/D</option>
            <option value="true_false">Đúng / Sai</option>
          </select>
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
            URL Theme Video tình huống thực tế phục vụ bài tập
          </span>
          <input
            type="text"
            value={quiz.videoUrl || ''}
            onChange={(e) => patch({ videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
          />
        </div>
      </div>

      <div>
        <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
          Mô tả bối cảnh tình huống trong video
        </span>
        <textarea
          rows={2}
          value={quiz.videoDescription || ''}
          onChange={(e) => patch({ videoDescription: e.target.value })}
          placeholder="VD: Chị Lan nhận cuộc gọi trúng thưởng..."
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
        />
      </div>

      <div>
        <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
          Câu hỏi trắc nghiệm dựa theo video tình huống
        </span>
        <input
          type="text"
          value={quiz.question || ''}
          onChange={(e) => patch({ question: e.target.value })}
          placeholder="Nhập câu hỏi..."
          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
        />
      </div>

      <div>
        <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
          Lựa chọn (bấm chọn để đánh dấu đáp án đúng)
        </span>
        <div className="grid gap-2 sm:grid-cols-2">
          {OPTION_KEYS.map((key) => {
            if (isTrueFalse && (key === 'C' || key === 'D')) return null;
            const isCorrect = quiz.correct === key;
            return (
              <div
                key={key}
                className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${
                  isCorrect
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => patch({ correct: key })}
                  title="Đánh dấu đáp án đúng"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                    isCorrect
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {key}
                </button>
                <input
                  type="text"
                  value={options[key] || ''}
                  onChange={(e) => setOption(key, e.target.value)}
                  placeholder={
                    isTrueFalse
                      ? key === 'A'
                        ? 'Đúng'
                        : 'Sai'
                      : `Lựa chọn ${key}`
                  }
                  disabled={isTrueFalse}
                  className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none disabled:text-slate-500"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
          Giải thích sau khi trả lời (tuỳ chọn)
        </span>
        <textarea
          rows={2}
          value={quiz.explain || ''}
          onChange={(e) => patch({ explain: e.target.value })}
          placeholder="Giải thích ngắn giúp học viên hiểu vì sao đáp án này đúng."
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
        />
      </div>
    </div>
  );
}
