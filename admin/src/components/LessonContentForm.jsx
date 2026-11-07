import { useMemo, useRef } from 'react';
import {
  resolveVideoSource,
  buildVideoEmbedUrl,
} from '../utils/videoSource.js';
import {
  VideoIcon,
  FileTextIcon,
  ImageIcon,
  XIcon,
} from './icons.jsx';

export const LESSON_CONTENT_TYPES = ['video', 'video_pdf', 'image_pdf'];

export const CONTENT_TYPE_OPTIONS = [
  {
    value: 'video',
    label: 'Chỉ Video',
    description: 'Video YouTube hoặc Google Drive',
    Icon: VideoIcon,
  },
  {
    value: 'video_pdf',
    label: 'PDF + Video embed',
    description: 'File PDF kèm video nhúng',
    Icon: FileTextIcon,
  },
  {
    value: 'image_pdf',
    label: 'Ảnh URL + PDF',
    description: 'Ảnh dán URL kèm file PDF',
    Icon: ImageIcon,
  },
];

/** Tạo bản nháp bài học mới (dùng trong CourseForm). */
export function createEmptyLessonDraft(contentType = 'video') {
  return {
    key: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    id: null,
    contentType,
    title: '',
    durationSeconds: 0,
    videoUrl: '',
    imageUrl: '',
    pdfFile: null,
    pdfUrl: '',
    pdfName: '',
  };
}

/** Chuyển bài học từ server về bản nháp để chỉnh sửa. */
export function lessonToDraft(lesson) {
  const videoUrl = lesson.videoProvider === 'drive'
    ? `https://drive.google.com/file/d/${lesson.driveFileId}/view`
    : lesson.youtubeId
      ? `https://www.youtube.com/watch?v=${lesson.youtubeId}`
      : '';
  return {
    key: lesson._id,
    id: lesson._id,
    contentType: lesson.contentType || 'video',
    title: lesson.title || '',
    durationSeconds: Number(lesson.durationSeconds) || 0,
    videoUrl,
    imageUrl: lesson.imageUrl || '',
    pdfFile: null,
    pdfUrl: lesson.pdfUrl || '',
    pdfName: lesson.pdfName || '',
  };
}

/** Đóng gói bản nháp thành FormData gửi lên API. */
export function draftToFormData(draft, order) {
  const form = new FormData();
  form.append('title', (draft.title || '').trim());
  form.append('contentType', draft.contentType || 'video');
  form.append('durationSeconds', String(Number(draft.durationSeconds) || 0));
  if (order !== undefined) form.append('order', String(order));

  if (draft.contentType === 'image_pdf') {
    form.append('imageUrl', (draft.imageUrl || '').trim());
  } else {
    form.append('videoUrl', (draft.videoUrl || '').trim());
  }

  if (draft.pdfFile) {
    form.append('pdf', draft.pdfFile);
  }
  return form;
}

/** Nhãn + màu badge của loại nội dung (dùng trong bảng LessonManager). */
export function describeContentType(lesson) {
  const type = lesson?.contentType || 'video';
  if (type === 'video_pdf') {
    return { label: 'PDF + Video', className: 'bg-violet-100 text-violet-700' };
  }
  if (type === 'image_pdf') {
    return { label: 'Ảnh + PDF', className: 'bg-amber-100 text-amber-700' };
  }
  return { label: 'Chỉ Video', className: 'bg-sky-100 text-sky-700' };
}

/**
 * Form nội dung bài học dùng chung cho CourseForm và LessonManager.
 *
 * Props:
 * - value      : bản nháp bài học (xem createEmptyLessonDraft)
 * - onChange   : (draft) => void
 * - onRemove   : optional — nút xoá (chỉ hiện khi có)
 * - onMoveUp / onMoveDown : optional — nút sắp xếp thứ tự
 * - disableUp / disableDown : optional
 * - compact    : gọn dạng card cho danh sách trong CourseForm
 */
export default function LessonContentForm({
  value,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
  compact = false,
}) {
  const draft = value;
  const pdfInputRef = useRef(null);

  const patch = (changes) => onChange({ ...draft, ...changes });

  const source = useMemo(
    () => resolveVideoSource(draft?.videoUrl || ''),
    [draft?.videoUrl]
  );
  const embedUrl = useMemo(
    () => buildVideoEmbedUrl(source),
    [source]
  );

  const showVideo = draft.contentType === 'video' || draft.contentType === 'video_pdf';
  const showImage = draft.contentType === 'image_pdf';
  const showPdf = draft.contentType === 'video_pdf' || draft.contentType === 'image_pdf';

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0] || null;
    patch({
      pdfFile: file,
      pdfName: file ? file.name : draft.pdfName,
      pdfUrl: file ? '' : draft.pdfUrl,
    });
  };

  return (
    <div className="space-y-2.5 rounded-md border border-slate-200 bg-white p-3">
      {/* ─── Header: 3 nút chọn loại nội dung ─── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Loại nội dung
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPE_OPTIONS.map(({ value, label, description, Icon }) => {
            const active = draft.contentType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => patch({ contentType: value })}
                title={description}
                className={[
                  'flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold transition',
                  active
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                ].join(' ')}
              >
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {(onMoveUp || onMoveDown || onRemove) && (
          <div className="ml-auto flex items-center gap-1">
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
                className="rounded border border-red-200 p-1 text-red-600 hover:bg-red-50"
              >
                <XIcon aria-hidden="true" className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Tiêu đề + thời lượng ─── */}
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-bold text-slate-700">
            Tiêu đề *
          </label>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
            placeholder="VD: Giới thiệu kim móc & len sợi"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold text-slate-700">
            Thời lượng (giây)
          </label>
          <input
            type="number"
            value={draft.durationSeconds}
            onChange={(e) =>
              patch({ durationSeconds: Number(e.target.value) || 0 })
            }
            min="0"
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
          />
        </div>
      </div>

      {/* ─── Video (YouTube / Google Drive) ─── */}
      {showVideo && (
        <div>
          <label className="mb-1 block text-[11px] font-bold text-slate-700">
            Video (YouTube hoặc Google Drive) *
          </label>
          <input
            type="text"
            value={draft.videoUrl}
            onChange={(e) => patch({ videoUrl: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
            placeholder="https://www.youtube.com/watch?v=... hoặc https://drive.google.com/file/d/.../view"
          />
          <p className="mt-0.5 text-[10px] text-slate-400">
            {source.provider === 'drive'
              ? 'Đã nhận diện Google Drive — sẽ nhúng qua đường dẫn /preview.'
              : source.provider === 'youtube'
                ? 'Đã nhận diện YouTube — sẽ nhúng qua đường dẫn /embed.'
                : 'Hỗ trợ link youtube.com, youtu.be, /embed/, /shorts/ hoặc link Google Drive.'}
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

      {/* ─── Ảnh URL ─── */}
      {showImage && (
        <div>
          <label className="mb-1 block text-[11px] font-bold text-slate-700">
            Ảnh (URL) *
          </label>
          <input
            type="text"
            value={draft.imageUrl}
            onChange={(e) => patch({ imageUrl: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-primary-600 focus:outline-none"
            placeholder="https://images.unsplash.com/..."
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

      {/* ─── File PDF ─── */}
      {showPdf && (
        <div>
          <label className="mb-1 block text-[11px] font-bold text-slate-700">
            File PDF *
          </label>
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfChange}
            className="w-full text-xs"
          />
          {draft.pdfFile ? (
            <p className="mt-0.5 text-[10px] font-bold text-emerald-600">
              Đã chọn: {draft.pdfFile.name}
            </p>
          ) : draft.pdfUrl ? (
            <p className="mt-0.5 text-[10px] text-slate-500">
              File hiện tại:{' '}
              <span className="font-bold text-slate-700">{draft.pdfName || 'PDF'}</span>{' '}
              — chọn file mới để thay thế.
            </p>
          ) : (
            <p className="mt-0.5 text-[10px] text-red-500">
              Chưa chọn file PDF (tối đa 20MB).
            </p>
          )}
        </div>
      )}

      {!compact && (
        <p className="text-[10px] text-slate-400">
          Nội dung hiển thị:{' '}
          {CONTENT_TYPE_OPTIONS.find((o) => o.value === draft.contentType)?.label}.
        </p>
      )}
    </div>
  );
}
