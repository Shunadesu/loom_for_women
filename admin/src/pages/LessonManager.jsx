import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAllCoursesAdmin } from '../services/courseApi.js';
import {
  fetchLessonsByCourseAdmin,
  createLessonAdmin,
  updateLessonAdmin,
  deleteLessonAdmin,
  reorderLessonsAdmin,
} from '../services/lessonApi.js';
import { fetchCourseContent } from '../services/courseIntakeApi.js';
import { resolveImageUrl } from '../utils/imageUrl.js';
import { buildVideoEmbedUrl } from '../utils/videoSource.js';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  VideoIcon,
  ArrowLeftIcon,
  EyeIcon,
  XIcon,
  FileTextIcon,
} from '../components/icons.jsx';
import LessonContentForm, {
  createEmptyLessonDraft,
  describeContentType,
} from '../components/LessonContentForm.jsx';
import LessonFourPartModal from '../components/LessonFourPartModal.jsx';
import DocumentManagerModal from '../components/DocumentManagerModal.jsx';
import { useNotification } from '../store/notificationStore.js';

export default function LessonManager() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [contentMap, setContentMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [previewingItem, setPreviewingItem] = useState(null);
  const [docsModalFor, setDocsModalFor] = useState(null);
  const [intakeLessonId, setIntakeLessonId] = useState(null);
  const { notify } = useNotification();

  useEffect(() => {
    if (!courseId) return;
    loadCourse();
    loadLessons();
  }, [courseId]);

  async function loadContentMap() {
    try {
      const data = await fetchCourseContent(courseId);
      const map = {};
      for (const item of data.items || []) {
        map[String(item._id)] = item.content || {};
      }
      setContentMap(map);
    } catch {
      setContentMap({});
    }
  }

  async function loadCourse() {
    try {
      const all = await fetchAllCoursesAdmin();
      const found = all.find((c) => String(c._id) === String(courseId));
      setCourse(found || null);
    } catch (err) {
      console.error('loadCourse failed', err);
    }
  }

  async function loadLessons() {
    setLoading(true);
    try {
      const data = await fetchLessonsByCourseAdmin(courseId);
      setItems(sortByOrder(data));
      await loadContentMap();
    } catch (err) {
      notify({ type: 'error', title: 'Tải dữ liệu thất bại', message: 'Không tải được bài học.' });
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function handleEdit(item) {
    setEditingItem(item);
    setModalOpen(true);
  }

  function handlePreview(item) {
    setPreviewingItem(item);
  }

  async function handleDelete(item) {
    if (!confirm(`Xoá bài học "${item.title}"?`)) return;
    try {
      await deleteLessonAdmin(item._id);
      setItems(items.filter((l) => l._id !== item._id));
    } catch (err) {
      notify({ type: 'error', title: 'Xoá thất bại', message: err?.response?.data?.error || 'Xoá thất bại.' });
    }
  }

  async function handleSave(draft) {
    try {
      const payload = draftToFormData(draft);
      if (editingItem) {
        const updated = await updateLessonAdmin(editingItem._id, payload);
        setItems(items.map((l) => (l._id === updated._id ? updated : l)));
      } else {
        const created = await createLessonAdmin(courseId, payload);
        setItems([...items, created]);
      }
      setModalOpen(false);
    } catch (err) {
      notify({ type: 'error', title: 'Lưu thất bại', message: err?.response?.data?.error || 'Lưu thất bại.' });
    }
  }

  async function handleMoveUp(index) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
    await saveOrder(next);
  }

  async function handleMoveDown(index) {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next);
    await saveOrder(next);
  }

  async function saveOrder(next) {
    try {
      const payload = next.map((l, i) => ({ id: l._id, order: i }));
      await reorderLessonsAdmin(courseId, payload);
    } catch (err) {
      notify({ type: 'error', title: 'Sắp xếp thất bại', message: 'Không sắp xếp được.' });
      loadLessons();
    }
  }

  const totalSeconds = useMemo(
    () => items.reduce((acc, l) => acc + (Number(l.durationSeconds) || 0), 0),
    [items]
  );

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => navigate('/courses')}
        className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#E60067]"
      >
        <ArrowLeftIcon aria-hidden="true" className="h-3 w-3" />
        Quay lại danh sách khóa học
      </button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-extrabold text-slate-900">
            Quản lý bài học
          </h1>
          {course ? (
            <p className="mt-0.5 text-xs text-slate-500">
              Khóa học:{' '}
              <span className="font-bold text-slate-700">{course.title}</span>
              <span className="ml-2 text-[11px] text-slate-400">({course.slug})</span>
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-slate-400">Đang tải thông tin khóa học...</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="flex items-center gap-1 rounded-md bg-primary-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary-700"
        >
          <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
          Thêm bài học
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
          <p className="text-[10px] font-bold uppercase text-slate-500">Bài học</p>
          <p className="text-base font-extrabold text-slate-900">{items.length}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
          <p className="text-[10px] font-bold uppercase text-slate-500">Tổng thời lượng</p>
          <p className="text-base font-extrabold text-slate-900">
            {Math.floor(totalSeconds / 60)} phút
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
          <p className="text-[10px] font-bold uppercase text-slate-500">Trạng thái</p>
          <p className="text-base font-extrabold text-emerald-600">
            {items.length > 0 ? 'Sẵn sàng' : 'Trống'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
          Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-white p-8 text-center">
          <VideoIcon aria-hidden="true" className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-xs font-bold text-slate-700">Chưa có bài học nào</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Bấm "Thêm bài học" để bắt đầu tạo nội dung.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="w-10 px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  STT
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Tiêu đề
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Nội dung
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  Video
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-700">
                  PDF
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Thời lượng
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  Tài liệu
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-700">
                  4 Phần
                </th>
                <th className="px-2 py-2 text-right text-[11px] font-bold uppercase text-slate-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, i) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-2 py-2 text-center text-[11px] font-bold text-slate-500">
                    {i + 1}
                  </td>
                  <td className="px-2 py-2">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className={[
                        'inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        describeContentType(item).className,
                      ].join(' ')}
                    >
                      {describeContentType(item).label}
                    </span>
                  </td>
                  <td className="px-2 py-2 font-mono text-[10px] text-slate-600">
                    {item.videoProvider === 'drive'
                      ? `Drive: ${item.driveFileId}`
                      : item.youtubeId
                        ? item.youtubeId
                        : '—'}
                  </td>
                  <td className="px-2 py-2">
                    {item.pdfUrl ? (
                      <a
                        href={resolveImageUrl(item.pdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        title={item.pdfName || 'Mở PDF'}
                        className="inline-flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-[#E60067] hover:bg-pink-100"
                      >
                        <FileTextIcon aria-hidden="true" className="h-3 w-3" />
                        {item.pdfName || 'PDF'}
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center text-[11px] text-slate-600">
                    {formatDuration(item.durationSeconds)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => setDocsModalFor(item)}
                      className="inline-flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-[#E60067] hover:bg-pink-100"
                      title="Quản lý tài liệu đính kèm"
                    >
                      <FileTextIcon aria-hidden="true" className="h-3 w-3" />
                      {item.documentsCount || 0}
                    </button>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {PART_BADGES.map((p) => {
                        const content = contentMap[String(item._id)] || {};
                        const ok = p.check(content);
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
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setIntakeLessonId(item._id)}
                        className="rounded bg-pink-50 p-1 hover:bg-pink-100"
                        title="Sửa nội dung 4 phần"
                      >
                        <FileTextIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#E60067]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePreview(item)}
                        className="rounded p-1 hover:bg-sky-50"
                        title="Xem trước"
                      >
                        <EyeIcon aria-hidden="true" className="h-3.5 w-3.5 text-sky-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveUp(i)}
                        disabled={i === 0}
                        className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                        title="Lên"
                      >
                        <ArrowUpIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(i)}
                        disabled={i === items.length - 1}
                        className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                        title="Xuống"
                      >
                        <ArrowDownIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="rounded p-1 hover:bg-blue-50"
                        title="Sửa"
                      >
                        <EditIcon aria-hidden="true" className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded p-1 hover:bg-red-50"
                        title="Xoá"
                      >
                        <TrashIcon aria-hidden="true" className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <LessonFormModal
          item={editingItem}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {previewingItem && (
        <PreviewModal item={previewingItem} onClose={() => setPreviewingItem(null)} />
      )}

      {docsModalFor && (
        <DocumentManagerModal
          lesson={docsModalFor}
          onClose={() => setDocsModalFor(null)}
        />
      )}

      {intakeLessonId && (
        <LessonFourPartModal
          courseId={courseId}
          lessonId={intakeLessonId}
          onClose={() => setIntakeLessonId(null)}
          onSaved={() => {
            setIntakeLessonId(null);
            loadLessons();
          }}
        />
      )}
    </div>
  );
}

const PART_BADGES = [
  { key: 'slide', short: 'Slide', label: 'Cung cấp kiến thức', check: (c) => (c.slides || []).length > 0 },
  { key: 'sim', short: 'Mô phỏng', label: 'Mô phỏng tình huống', check: (c) => (c.simulations || []).length > 0 },
  { key: 'sum', short: 'Tóm tắt', label: 'Tóm tắt bài học', check: (c) => Boolean(c.summary) },
  { key: 'quiz', short: 'Quiz', label: 'Đánh giá trắc nghiệm', check: (c) => (c.quizzes || []).length > 0 },
];

function LessonFormModal({ item, onClose, onSave }) {
  const [draft, setDraft] = useState(() =>
    item ? lessonToDraft(item) : createEmptyLessonDraft()
  );
  const [saving, setSaving] = useState(false);
  const { notify } = useNotification();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!draft.title.trim()) {
      notify({ type: 'warning', title: 'Thiếu thông tin', message: 'Tiêu đề không được trống.' });
      return;
    }
    const needsPdf = draft.contentType === 'video_pdf' || draft.contentType === 'image_pdf';
    if (needsPdf && !draft.pdfFile && !draft.pdfUrl) {
      notify({ type: 'warning', title: 'Thiếu file PDF', message: 'Vui lòng chọn file PDF.' });
      return;
    }
    if (draft.contentType === 'image_pdf' && !draft.imageUrl.trim()) {
      notify({ type: 'warning', title: 'Thiếu ảnh', message: 'Vui lòng nhập URL ảnh.' });
      return;
    }

    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-2xl rounded-lg bg-white p-4 shadow-xl">
        <h2 className="mb-3 text-sm font-extrabold text-slate-900">
          {item ? 'Sửa bài học' : 'Thêm bài học'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <LessonContentForm value={draft} onChange={setDraft} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-primary-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PreviewModal({ item, onClose }) {
  const type = item.contentType || 'video';
  const embedUrl = buildVideoEmbedUrl(item);
  const pdfUrl = item.pdfUrl ? resolveImageUrl(item.pdfUrl) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
          <h3 className="text-xs font-extrabold text-slate-900">{item.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100"
          >
            <XIcon aria-hidden="true" className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {type === 'image_pdf' ? (
          <div className="space-y-2 bg-slate-50 p-3">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="max-h-[45vh] w-full rounded object-contain"
              />
            )}
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                title="Xem trước PDF"
                className="h-[45vh] w-full rounded border border-slate-200 bg-white"
              />
            )}
          </div>
        ) : (
          <div className="aspect-video w-full bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Không có video để xem trước.
              </div>
            )}
          </div>
        )}

        {type !== 'image_pdf' && pdfUrl && (
          <div className="border-t border-slate-200 px-3 py-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E60067] hover:underline"
            >
              <FileTextIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Mở tài liệu PDF ({item.pdfName || 'PDF'})
            </a>
          </div>
        )}

        <div className="bg-slate-50 px-3 py-1.5 text-[10px] text-slate-500">
          Loại: <span className="font-bold text-slate-700">{describeContentType(item).label}</span>
          {item.videoProvider === 'drive' ? (
            <span className="ml-3">
              · Drive ID: <span className="font-mono">{item.driveFileId}</span>
            </span>
          ) : item.youtubeId ? (
            <span className="ml-3">
              · YouTube ID: <span className="font-mono">{item.youtubeId}</span>
            </span>
          ) : null}
          {item.durationSeconds > 0 && (
            <span className="ml-3">
              · {Math.floor(item.durationSeconds / 60)} phút{' '}
              {item.durationSeconds % 60} giây
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function sortByOrder(arr) {
  return [...arr].sort(
    (a, b) =>
      (a.order ?? 0) - (b.order ?? 0) ||
      (a.createdAt < b.createdAt ? -1 : 1)
  );
}

function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${m}p ${s}s`;
  if (m > 0) return `${m} phút`;
  return `${s}s`;
}
