import { useState } from 'react';
import QuizEditor from './QuizEditor.jsx';

/**
 * Editor Phần 4 — Danh sách câu hỏi trắc nghiệm (hỗ trợ nhiều câu).
 *
 * Props:
 * - value    : array quiz [{ question, options{A,B,C,D}, correct, videoUrl, videoDescription, explain, type }]
 * - onChange : (nextArray) => void
 */

export const emptyQuiz = () => ({
  question: '',
  options: { A: '', B: '', C: '', D: '' },
  correct: 'B',
  videoUrl: '',
  videoDescription: '',
  explain: '',
  type: 'single',
});

export default function QuizListEditor({ value = [], onChange }) {
  const [openIndex, setOpenIndex] = useState(0);
  const quizzes = Array.isArray(value) ? value : [];

  const update = (index, patch) => {
    onChange(quizzes.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const addQuiz = () => {
    onChange([...quizzes, emptyQuiz()]);
    setOpenIndex(quizzes.length);
  };

  const removeQuiz = (index) => {
    onChange(quizzes.filter((_, i) => i !== index));
    setOpenIndex(0);
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= quizzes.length) return;
    const next = [...quizzes];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setOpenIndex(target);
  };

  const duplicate = (index) => {
    const next = [...quizzes];
    next.splice(index + 1, 0, { ...quizzes[index], options: { ...quizzes[index].options } });
    onChange(next);
    setOpenIndex(index + 1);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-700">
          Câu hỏi trắc nghiệm ({quizzes.length})
        </span>
        <button
          type="button"
          onClick={addQuiz}
          className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-100"
        >
          + Thêm câu hỏi
        </button>
      </div>

      {quizzes.length === 0 && (
        <p className="rounded-md border border-dashed border-amber-200 bg-white px-2.5 py-3 text-center text-[11px] text-slate-400">
          Chưa có câu hỏi nào. Bấm "+ Thêm câu hỏi" để bắt đầu.
        </p>
      )}

      {quizzes.map((quiz, i) => {
        const expanded = openIndex === i;
        return (
          <div
            key={`quiz-${i}`}
            className="rounded-lg border border-amber-200 bg-white p-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-black text-white">
                {i + 1}
              </span>
              <input
                type="text"
                value={quiz.question || ''}
                onChange={(e) => update(i, { question: e.target.value })}
                placeholder="Nhập câu hỏi..."
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-amber-600"
              />
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                title="Lên"
                className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === quizzes.length - 1}
                title="Xuống"
                className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => duplicate(i)}
                title="Nhân bản câu hỏi"
                className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
              >
                ⧉
              </button>
              <button
                type="button"
                onClick={() => setOpenIndex(expanded ? -1 : i)}
                title="Mở rộng"
                className="rounded border border-slate-200 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
              >
                {expanded ? '−' : '+'}
              </button>
              <button
                type="button"
                onClick={() => removeQuiz(i)}
                title="Xoá câu hỏi"
                className="rounded border border-rose-200 px-1.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
              >
                ✕
              </button>
            </div>

            {expanded && (
              <div className="mt-2.5">
                <QuizEditor value={quiz} onChange={(next) => update(i, next)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
