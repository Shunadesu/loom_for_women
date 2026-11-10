import { useMemo, useState } from 'react';
import {
  LESSON_STEPS,
  LessonStepSlide,
  LessonStepSimulation,
  LessonStepSummary,
  LessonStepQuiz,
  LessonStepMedia,
} from './lesson/LessonSteps.jsx';
import {
  createLessonDraft,
  lessonToDraft,
  draftToFormData,
  missingParts,
} from './lessonDraft.js';

export {
  createLessonDraft,
  lessonToDraft,
  draftToFormData,
  missingParts,
};

/**
 * Editor nội dung 1 bài học — gồm 2 khối:
 *   1. "Nội dung 4 phần": slide → mô phỏng → tóm tắt → trắc nghiệm
 *   2. "Media bổ sung"  : video / ảnh / PDF (tuỳ chọn)
 *
 * Props:
 * - value        : bản nháp bài học (xem createLessonDraft)
 * - onChange     : (draft) => void
 * - onRemove     : optional — nút xoá
 * - onMoveUp/Down: optional — sắp xếp thứ tự
 * - disableUp/Down
 * - index        : số thứ tự hiển thị (1-based)
 *
 * Ghi chú: JSX từng phần nằm trong components/lesson/LessonSteps.jsx — dùng
 * chung với trang nhập bài học nhiều bước (pages/LessonFormPage.jsx).
 */

const PART_META = LESSON_STEPS.filter((s) => s.partKey);

export default function LessonContentEditor({
  value,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
  index = 1,
}) {
  const draft = value;
  const [tab, setTab] = useState('four');

  const patch = (changes) => onChange({ ...draft, ...changes });

  const missing = useMemo(() => missingParts(draft), [draft]);

  const hasMedia =
    Boolean(draft.videoUrl || draft.imageUrl || draft.pdfFile || draft.pdfUrl);

  return (
    <div className="space-y-2.5 rounded-lg border border-slate-200 bg-white p-3">
      {/* ─── Header: tiêu đề + thứ tự + trạng thái 4 phần ─── */}
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-black text-white">
              {index}
            </span>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="Tên bài học (VD: Bài 1: Nhận diện bẫy việc nhẹ lương cao)"
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-primary-600 focus:outline-none"
            />
          </div>
          {/* Checklist 4 phần */}
          <div className="flex flex-wrap items-center gap-1">
            {PART_META.map((p) => {
              const ok = !missing.includes(p.partKey);
              return (
                <span
                  key={p.key}
                  title={p.label}
                  className={[
                    'rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                    ok
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400',
                  ].join(' ')}
                >
                  {ok ? '✓' : '–'} {p.short}
                </span>
              );
            })}
            {missing.length > 0 && (
              <span className="text-[10px] font-bold text-amber-600">
                Thiếu: {missing.join(', ')}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              disabled={disableUp}
              className="rounded border border-slate-300 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Lên
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              disabled={disableDown}
              className="rounded border border-slate-300 px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Xuống
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              title="Xoá bài học"
              className="rounded border border-red-200 px-1.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50"
            >
              Xoá
            </button>
          )}
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1.5 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('four')}
          className={[
            'rounded-t-md px-2.5 py-1.5 text-[11px] font-bold',
            tab === 'four'
              ? 'bg-[#E60067] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          ].join(' ')}
        >
          Nội dung 4 phần
        </button>
        <button
          type="button"
          onClick={() => setTab('media')}
          className={[
            'rounded-t-md px-2.5 py-1.5 text-[11px] font-bold',
            tab === 'media'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          ].join(' ')}
        >
          Media bổ sung {hasMedia ? '•' : ''}
        </button>
      </div>

      {/* ─── Tab: 4 phần ─── */}
      {tab === 'four' && (
        <div className="space-y-2.5 pt-1">
          <LessonStepSlide value={draft} onChange={onChange} />
          <LessonStepSimulation value={draft} onChange={onChange} />
          <LessonStepSummary value={draft} onChange={onChange} />
          <LessonStepQuiz value={draft} onChange={onChange} />
        </div>
      )}

      {/* ─── Tab: media bổ sung ─── */}
      {tab === 'media' && (
        <div className="pt-1">
          <LessonStepMedia value={draft} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

export { emptyQuiz } from './QuizListEditor.jsx';
