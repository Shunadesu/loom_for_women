import { useMemo, useState } from 'react';
import SlideEditorList from './SlideEditorList.jsx';
import SimulationEditor from './SimulationEditor.jsx';
import QuizListEditor, { emptyQuiz } from './QuizListEditor.jsx';
import SummaryFormatPicker from './SummaryFormatPicker.jsx';
import {
  resolveVideoSource,
  buildVideoEmbedUrl,
} from '../utils/videoSource.js';
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
 * - value        : bản nháp bài học (xem createEmptyLessonDraft)
 * - onChange     : (draft) => void
 * - onRemove     : optional — nút xoá
 * - onMoveUp/Down: optional — sắp xếp thứ tự
 * - disableUp/Down
 * - index        : số thứ tự hiển thị (1-based)
 */

const CONTENT_TYPES = [
  { value: 'video', label: 'Chỉ Video' },
  { value: 'video_pdf', label: 'PDF + Video' },
  { value: 'image_pdf', label: 'Ảnh + PDF' },
];

const PART_META = [
  { key: 'slide', short: 'Slide', label: 'Phần 1: Cung cấp kiến thức' },
  { key: 'mô phỏng', short: 'Mô phỏng', label: 'Phần 2: Mô phỏng tình huống' },
  { key: 'tóm tắt', short: 'Tóm tắt', label: 'Phần 3: Tóm tắt bài học' },
  { key: 'trắc nghiệm', short: 'Quiz', label: 'Phần 4: Đánh giá trắc nghiệm' },
];

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
  const patchNested = (key, changes) =>
    onChange({ ...draft, [key]: { ...(draft[key] || {}), ...changes } });

  const missing = useMemo(() => missingParts(draft), [draft]);

  const source = useMemo(
    () => resolveVideoSource(draft?.videoUrl || ''),
    [draft?.videoUrl]
  );
  // buildVideoEmbedUrl nhận { videoProvider, youtubeId, driveFileId }
  const embedUrl = useMemo(
    () =>
      buildVideoEmbedUrl({
        videoProvider: source.provider,
        youtubeId: source.youtubeId,
        driveFileId: source.driveFileId,
      }),
    [source]
  );

  const showVideo = draft.contentType === 'video' || draft.contentType === 'video_pdf';
  const showImage = draft.contentType === 'image_pdf';
  const showPdf = draft.contentType === 'video_pdf' || draft.contentType === 'image_pdf';

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
              const ok = !missing.includes(p.key);
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
          {/* Phần 1 */}
          <div className="space-y-2 rounded-lg border border-pink-200 bg-pink-50/60 p-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#E60067]">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E60067] text-[10px] text-white">
                1
              </span>
              Phần 1: Cung cấp kiến thức (Slide &amp; nội dung)
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Tiêu đề hiển thị ở phần 1
                </label>
                <input
                  type="text"
                  value={draft.knowledgeTitle}
                  onChange={(e) => patch({ knowledgeTitle: e.target.value })}
                  placeholder="VD: Bài 1: Cầm kim móc & tạo mũi móch cơ bản"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                  Thời lượng bài học (giây)
                </label>
                <input
                  type="number"
                  min="0"
                  value={draft.durationSeconds}
                  onChange={(e) =>
                    patch({ durationSeconds: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-600">
                Nội dung bài học dạng Slide &amp; Text chi tiết
              </label>
              <textarea
                rows={3}
                value={draft.knowledgeContent}
                onChange={(e) => patch({ knowledgeContent: e.target.value })}
                placeholder="Nội dung bài học dạng Slide & Text chi tiết (cho công nhân học)..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-[#E60067]"
              />
            </div>

            <div className="grid gap-2 rounded-lg border border-pink-200 bg-white/80 p-2.5 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-[10px] font-bold text-slate-600">
                  Tiêu đề tài liệu Slide:
                </span>
                <input
                  type="text"
                  value={draft.slidePdfTitle}
                  onChange={(e) => patch({ slidePdfTitle: e.target.value })}
                  placeholder="VD: Slide Cẩm nang An toàn Số"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#E60067]"
                />
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-bold text-slate-600">
                  File PDF slide (tải lên để học viên tải về):
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    patch({
                      slidePdfFile: file,
                      slidePdfName: file ? file.name : draft.slidePdfName,
                    });
                  }}
                  className="w-full text-[11px] text-slate-600"
                />
                {(draft.slidePdfName || draft.slidePdfUrl) && (
                  <p className="mt-0.5 truncate text-[10px] font-bold text-emerald-600">
                    {draft.slidePdfName || 'PDF hiện tại'}
                    {draft.slidePdfFile ? ' (mới)' : ''}
                  </p>
                )}
              </div>
            </div>

            <SlideEditorList
              value={draft.slides}
              onChange={(slides) => patch({ slides })}
            />
          </div>

          {/* Phần 2 */}
          <div className="space-y-2 rounded-lg border border-teal-200 bg-teal-50/60 p-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-teal-800">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-700 text-[10px] text-white">
                2
              </span>
              Phần 2: Mô phỏng tình huống (Video &amp; Đúng/Sai)
            </p>
            <SimulationEditor
              value={draft.simulation}
              onChange={(sim) => patchNested('simulation', sim)}
            />
          </div>

          {/* Phần 3 */}
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-800">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[10px] text-white">
                3
              </span>
              Phần 3: Tóm tắt bài học
            </p>
            <SummaryFormatPicker
              value={draft.summary}
              onChange={(summary) => patchNested('summary', summary)}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-[10px] font-bold text-slate-600">
                  Tải lên ảnh/poster infographic
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    patch({ summaryImageFile: e.target.files?.[0] || null })
                  }
                  className="w-full text-[11px] text-slate-600"
                />
                {draft.summaryImageFile && (
                  <p className="mt-0.5 truncate text-[10px] font-bold text-emerald-600">
                    {draft.summaryImageFile.name}
                  </p>
                )}
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-bold text-slate-600">
                  Tải lên file PDF tóm tắt
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) =>
                    patch({ summaryPdfFile: e.target.files?.[0] || null })
                  }
                  className="w-full text-[11px] text-slate-600"
                />
                {draft.summaryPdfFile ? (
                  <p className="mt-0.5 truncate text-[10px] font-bold text-emerald-600">
                    {draft.summaryPdfFile.name}
                  </p>
                ) : draft.summary?.pdfUrl ? (
                  <p className="mt-0.5 truncate text-[10px] font-bold text-slate-500">
                    PDF hiện tại: {draft.summary.pdfName || 'PDF'}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Phần 4 */}
          <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/60 p-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-900">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] text-white">
                4
              </span>
              Phần 4: Đánh giá nội dung học (Trắc nghiệm)
            </p>
            <QuizListEditor
              value={draft.quizzes}
              onChange={(quizzes) => patch({ quizzes })}
            />
          </div>
        </div>
      )}

      {/* ─── Tab: media bổ sung ─── */}
      {tab === 'media' && (
        <div className="space-y-2.5 pt-1">
          <p className="text-[10px] text-slate-400">
            Tuỳ chọn — dùng khi muốn học viên xem video / ảnh / PDF riêng ngoài
            nội dung 4 phần.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Loại media
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_TYPES.map((t) => {
                const active = draft.contentType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => patch({ contentType: t.value })}
                    className={[
                      'rounded-md border px-2 py-1 text-[11px] font-bold transition',
                      active
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {showVideo && (
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Video (YouTube hoặc Google Drive)
              </label>
              <input
                type="text"
                value={draft.videoUrl}
                onChange={(e) => patch({ videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... hoặc https://drive.google.com/file/d/.../view"
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
              />
              <p className="mt-0.5 text-[10px] text-slate-400">
                {source.provider === 'drive'
                  ? 'Đã nhận diện Google Drive — sẽ nhúng qua đường dẫn /preview.'
                  : source.provider === 'youtube'
                    ? 'Đã nhận diện YouTube — sẽ nhúng qua đường dẫn /embed.'
                    : 'Bỏ trống nếu bài học chỉ có nội dung 4 phần.'}
              </p>
              {embedUrl && (
                <div className="mt-1.5 overflow-hidden rounded-md border border-slate-200 bg-black">
                  <iframe
                    src={embedUrl}
                    title="Preview video bài học"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full"
                  />
                </div>
              )}
            </div>
          )}

          {showImage && (
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Ảnh (URL) *
              </label>
              <input
                type="text"
                value={draft.imageUrl}
                onChange={(e) => patch({ imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
              />
              {draft.imageUrl && (
                <img
                  src={draft.imageUrl}
                  alt="Preview ảnh bài học"
                  className="mt-1.5 h-20 w-32 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
          )}

          {showPdf && (
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                File PDF *
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  patch({
                    pdfFile: file,
                    pdfName: file ? file.name : draft.pdfName,
                  });
                }}
                className="w-full text-xs"
              />
              {draft.pdfFile ? (
                <p className="mt-0.5 text-[10px] font-bold text-emerald-600">
                  Đã chọn: {draft.pdfFile.name}
                </p>
              ) : draft.pdfUrl ? (
                <p className="mt-0.5 text-[10px] text-slate-500">
                  File hiện tại:{' '}
                  <span className="font-bold text-slate-700">
                    {draft.pdfName || 'PDF'}
                  </span>{' '}
                  — chọn file mới để thay thế.
                </p>
              ) : (
                <p className="mt-0.5 text-[10px] text-red-500">
                  Chưa chọn file PDF (tối đa 20MB).
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { emptyQuiz };
